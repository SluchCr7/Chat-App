const asyncHandler = require("express-async-handler");
const { Group, validateGroup } = require("../modules/Group");
const { Channel, validateChannel } = require("../modules/Channel");
const { Message } = require("../modules/Message");
const { User } = require("../modules/User");
const { GroupMember } = require("../modules/GroupMember");
const { GroupInvite } = require("../modules/GroupInvite");
const crypto = require("crypto");
const { io } = require("../config/socket");

// Create a Group and a default #general channel
const createGroup = asyncHandler(async (req, res) => {
    const { error } = validateGroup(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const inviteLink = crypto.randomBytes(6).toString("hex");

    const newGroup = new Group({
        name: req.body.name,
        description: req.body.description || "",
        creator: req.user._id,
        inviteLink,
        members: [{
            user: req.user._id,
            role: "owner"
        }],
        isPrivate: req.body.isPrivate || false
    });

    await newGroup.save();

    // Create GroupMember record for the owner
    const newGM = new GroupMember({
        group: newGroup._id,
        user: req.user._id,
        role: "owner"
    });
    await newGM.save();

    // Create default public channel
    const defaultChannel = new Channel({
        group: newGroup._id,
        name: "general",
        description: "General discussion channel",
        type: "public",
        creator: req.user._id
    });

    await defaultChannel.save();

    res.status(201).json({ group: newGroup, defaultChannel });
});

// Get all groups for the logged-in user
const getGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find({
        "members.user": req.user._id
    }).populate("members.user", "username profilePic profileName description status");

    res.status(200).json(groups);
});

// Get a single group details (with channels & populated members)
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id)
        .populate("members.user", "username profilePic profileName description status")
        .populate("joinRequests", "username profilePic");

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Verify membership
    const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Access Denied. You are not a member of this group." });

    const channels = await Channel.find({ group: group._id });

    res.status(200).json({ group, channels });
});

// Update Group settings (Owner or Admin only)
const updateGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check permission
    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return res.status(403).json({ message: "Action unauthorized. Owner or Admin rights required." });
    }

    if (req.body.name) group.name = req.body.name;
    if (req.body.description !== undefined) group.description = req.body.description;
    if (req.body.isPrivate !== undefined) group.isPrivate = req.body.isPrivate;

    await group.save();
    res.status(200).json(group);
});

// Join group via invite Link slug
const joinGroupByInvite = asyncHandler(async (req, res) => {
    const group = await Group.findOne({ inviteLink: req.params.inviteLink });
    if (!group) return res.status(404).json({ message: "Invalid invite link" });

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ message: "You are already a member of this group" });

    if (group.isPrivate) {
        if (group.joinRequests.includes(req.user._id)) {
            return res.status(400).json({ message: "Join request already pending" });
        }
        group.joinRequests.push(req.user._id);
        await group.save();
        return res.status(200).json({ status: "pending", message: "Join request submitted successfully" });
    }

    group.members.push({ user: req.user._id, role: "member" });
    await group.save();

    // Create GroupMember record
    const newGM = new GroupMember({
        group: group._id,
        user: req.user._id,
        role: "member"
    });
    await newGM.save();

    res.status(200).json({ status: "joined", group });
});

// Handle private group join requests (Owner / Admin only)
const handleJoinRequest = asyncHandler(async (req, res) => {
    const { action, userId } = req.body; // "approve" or "reject"
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return res.status(403).json({ message: "Action unauthorized." });
    }

    group.joinRequests = group.joinRequests.filter(reqId => reqId.toString() !== userId);

    if (action === "approve") {
        group.members.push({ user: userId, role: "member" });
        await group.save();

        const newGM = new GroupMember({
            group: group._id,
            user: userId,
            role: "member"
        });
        await newGM.save();

        io.to(`user_${userId}`).emit("group:joined", {
            _id: group._id,
            type: "group",
            name: group.name,
            avatar: group.avatar,
            description: group.description,
            membersCount: group.members.length,
            lastActivity: group.lastActivity,
            unreadCount: 0
        });

        res.status(200).json({ message: "Request approved. User added to group." });
    } else {
        await group.save();
        res.status(200).json({ message: "Request rejected." });
    }
});

// Change role / promote / demote (Owner or Admin only)
const changeMemberRole = asyncHandler(async (req, res) => {
    const { targetUserId, newRole } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const currentUserMember = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentUserMember || (currentUserMember.role !== "owner" && currentUserMember.role !== "admin")) {
        return res.status(403).json({ message: "Action unauthorized." });
    }

    const targetMember = group.members.find(m => m.user.toString() === targetUserId);
    if (!targetMember) return res.status(404).json({ message: "Target user is not a member of the group." });

    if (targetMember.role === "owner") {
        return res.status(400).json({ message: "Cannot modify owner role." });
    }

    targetMember.role = newRole;
    await group.save();

    // Sync GroupMember
    await GroupMember.findOneAndUpdate({ group: group._id, user: targetUserId }, { role: newRole });

    res.status(200).json({ message: "Member role updated successfully", group });
});

// Kick member (Owner or Admin only)
const kickMember = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const currentUserMember = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentUserMember || (currentUserMember.role !== "owner" && currentUserMember.role !== "admin")) {
        return res.status(403).json({ message: "Action unauthorized." });
    }

    const targetMember = group.members.find(m => m.user.toString() === targetUserId);
    if (!targetMember) return res.status(404).json({ message: "Target user is not a member." });

    if (targetMember.role === "owner") return res.status(400).json({ message: "Cannot kick the owner." });

    group.members = group.members.filter(m => m.user.toString() !== targetUserId);
    await group.save();

    // Delete GroupMember
    await GroupMember.deleteOne({ group: group._id, user: targetUserId });

    res.status(200).json({ message: "Member kicked successfully", group });
});

// Leave Group
const leaveGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(400).json({ message: "You are not a member of this group." });

    if (member.role === "owner") {
        return res.status(400).json({ message: "Owners cannot leave the group. Transfer ownership or delete group." });
    }

    group.members = group.members.filter(m => m.user.toString() !== req.user._id.toString());
    await group.save();

    await GroupMember.deleteOne({ group: group._id, user: req.user._id });

    res.status(200).json({ message: "You have left the group" });
});

// Create a Channel
const createChannel = asyncHandler(async (req, res) => {
    const { error } = validateChannel(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== "owner" && member.role !== "admin" && member.role !== "moderator")) {
        return res.status(403).json({ message: "Action unauthorized. Admin or Moderator privileges required." });
    }

    const newChannel = new Channel({
        group: group._id,
        name: req.body.name.toLowerCase().replace(/\s+/g, "-"),
        description: req.body.description || "",
        type: req.body.type || "public",
        creator: req.user._id
    });

    await newChannel.save();
    res.status(201).json(newChannel);
});

// Get channels in group
const getChannelsByGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Access Denied." });

    const channels = await Channel.find({ group: group._id });
    res.status(200).json(channels);
});

// Delete channel
const deleteChannel = asyncHandler(async (req, res) => {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const group = await Group.findById(channel.group);
    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return res.status(403).json({ message: "Action unauthorized." });
    }

    if (channel.name === "general") {
        return res.status(400).json({ message: "Cannot delete general channel." });
    }

    await Channel.findByIdAndDelete(channel._id);
    await Message.deleteMany({ channel: channel._id });

    res.status(200).json({ message: "Channel deleted successfully" });
});

// Global Group Search
const searchGroups = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const loggedUserId = req.user._id;

    if (!q || q.trim() === "") {
        return res.status(200).json([]);
    }

    const queryStr = q.trim();

    const matchingGroups = await Group.find({
        $or: [
            { name: { $regex: queryStr, $options: "i" } },
            { description: { $regex: queryStr, $options: "i" } }
        ]
    })
    .populate("creator", "username profileName")
    .select("name description avatar creator members isPrivate lastActivity inviteLink");

    const result = matchingGroups.map(grp => {
        const isJoined = grp.members.some(m => m.user.toString() === loggedUserId.toString());
        return {
            _id: grp._id,
            name: grp.name,
            description: grp.description,
            avatar: grp.avatar,
            creator: grp.creator,
            membersCount: grp.members.length,
            isPrivate: grp.isPrivate,
            isJoined,
            inviteLink: grp.inviteLink
        };
    });

    res.status(200).json(result);
});

// Invite a user to join a group
const inviteUserToGroup = asyncHandler(async (req, res) => {
    const { groupId, inviteeId } = req.body;
    const inviterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(m => m.user.toString() === inviterId.toString());
    if (!isMember) return res.status(403).json({ message: "You must be a member of the group to invite others" });

    const isAlreadyMember = group.members.some(m => m.user.toString() === inviteeId.toString());
    if (isAlreadyMember) return res.status(400).json({ message: "User is already a member of this group" });

    const existing = await GroupInvite.findOne({ group: groupId, invitee: inviteeId, status: "pending" });
    if (existing) return res.status(400).json({ message: "User is already invited to this group" });

    const newInvite = new GroupInvite({
        group: groupId,
        inviter: inviterId,
        invitee: inviteeId
    });
    await newInvite.save();

    // Emit real-time notification
    io.to(`user_${inviteeId}`).emit("group:invite_received", {
        _id: newInvite._id,
        group: { _id: group._id, name: group.name, avatar: group.avatar, description: group.description },
        inviter: { username: req.user.username, profileName: req.user.profileName, profilePic: req.user.profilePic }
    });

    res.status(201).json({ message: "Invitation sent successfully", invite: newInvite });
});

// Respond to group invitation
const respondToGroupInvite = asyncHandler(async (req, res) => {
    const { action } = req.body; // "accept" or "reject"
    const { inviteId } = req.params;
    const loggedUserId = req.user._id;

    const invite = await GroupInvite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invitation not found" });

    if (invite.invitee.toString() !== loggedUserId.toString()) {
        return res.status(403).json({ message: "Unauthorized response" });
    }

    invite.status = action === "accept" ? "accepted" : "rejected";
    await invite.save();

    if (action === "accept") {
        const group = await Group.findById(invite.group);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isMember = group.members.some(m => m.user.toString() === loggedUserId.toString());
        if (!isMember) {
            group.members.push({ user: loggedUserId, role: "member" });
            await group.save();

            const newGM = new GroupMember({
                group: group._id,
                user: loggedUserId,
                role: "member"
            });
            await newGM.save();

            // Emit joined update to sync sidebar
            io.to(`user_${loggedUserId}`).emit("group:joined", {
                _id: group._id,
                type: "group",
                name: group.name,
                avatar: group.avatar,
                description: group.description,
                membersCount: group.members.length,
                lastActivity: group.lastActivity,
                unreadCount: 0
            });
        }
    }

    res.status(200).json({ message: `Invitation ${action}ed successfully` });
});

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    joinGroupByInvite,
    handleJoinRequest,
    changeMemberRole,
    kickMember,
    leaveGroup,
    createChannel,
    getChannelsByGroup,
    deleteChannel,
    searchGroups,
    inviteUserToGroup,
    respondToGroupInvite
};
