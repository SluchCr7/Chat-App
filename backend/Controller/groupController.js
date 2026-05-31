const asyncHandler = require("express-async-handler");
const { Group, validateGroup } = require("../modules/Group");
const { Channel, validateChannel } = require("../modules/Channel");
const { Message } = require("../modules/Message");
const { User } = require("../modules/User");
const crypto = require("crypto");

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
        // Add to join requests
        if (group.joinRequests.includes(req.user._id)) {
            return res.status(400).json({ message: "Join request already pending" });
        }
        group.joinRequests.push(req.user._id);
        await group.save();
        return res.status(200).json({ status: "pending", message: "Join request submitted successfully" });
    }

    group.members.push({ user: req.user._id, role: "member" });
    await group.save();

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
        res.status(200).json({ message: "Request approved. User added to group." });
    } else {
        await group.save();
        res.status(200).json({ message: "Request rejected." });
    }
});

// Change role / promote / demote (Owner or Admin only)
const changeMemberRole = asyncHandler(async (req, res) => {
    const { targetUserId, newRole } = req.body; // "admin", "moderator", "member"
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

    res.status(200).json({ message: "You have left the group" });
});

// Create a Channel (Group member with Owner/Admin/Moderator role)
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

// Delete channel (Owner or Admin only)
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
    deleteChannel
};
