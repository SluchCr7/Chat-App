const asyncHandler = require("express-async-handler");
const { Conversation } = require("../modules/Conversation");
const { Group } = require("../modules/Group");
const { GroupInvite } = require("../modules/GroupInvite");
const { UnreadCounter } = require("../modules/UnreadCounter");
const { Message } = require("../modules/Message");

// Get all conversations categorized for the sidebar (Direct, Groups, Archived, Requests)
const getSidebarConversations = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;

    // --- 1. DIRECT MESSAGES (excluding archived) ---
    const directConvs = await Conversation.find({
        participants: loggedUserId,
        archivedBy: { $ne: loggedUserId }
    })
    .populate("participants", "username profileName profilePic status isOnline description")
    .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profileName" }
    })
    .sort({ lastActivity: -1 });

    const directList = await Promise.all(directConvs.map(async (conv) => {
        const counter = await UnreadCounter.findOne({ user: loggedUserId, conversation: conv._id });
        const recipient = conv.participants.find(p => p._id.toString() !== loggedUserId.toString());
        
        return {
            _id: conv._id,
            type: "direct",
            recipient: recipient || { username: "Ghost", profileName: "ghost", profilePic: { url: "" }, status: "offline" },
            lastMessage: conv.lastMessage,
            lastActivity: conv.lastActivity,
            unreadCount: counter ? counter.unreadCount : 0,
            isPinned: conv.pinnedBy.includes(loggedUserId),
            isMuted: conv.mutedBy.includes(loggedUserId),
            isFavorite: conv.favoriteBy.includes(loggedUserId),
            draft: conv.drafts.find(d => d.user.toString() === loggedUserId.toString())?.text || ""
        };
    }));

    // --- 2. GROUPS (excluding archived) ---
    const groupsJoined = await Group.find({
        "members.user": loggedUserId,
        archivedBy: { $ne: loggedUserId }
    })
    .populate("members.user", "username profilePic profileName isOnline status")
    .sort({ lastActivity: -1 });

    const groupsList = await Promise.all(groupsJoined.map(async (grp) => {
        const counter = await UnreadCounter.findOne({ user: loggedUserId, group: grp._id });
        const onlineCount = grp.members.filter(m => m.user && m.user.isOnline).length;

        // Retrieve last message for the group
        const lastMsg = await Message.findOne({ group: grp._id })
            .populate("sender", "username profileName")
            .sort({ createdAt: -1 });

        return {
            _id: grp._id,
            type: "group",
            name: grp.name,
            avatar: grp.avatar,
            description: grp.description,
            inviteLink: grp.inviteLink,
            membersCount: grp.members.length,
            onlineCount,
            lastMessage: lastMsg,
            lastActivity: grp.lastActivity,
            unreadCount: counter ? counter.unreadCount : 0,
            isPinned: grp.pinnedBy.includes(loggedUserId),
            isMuted: grp.mutedBy.includes(loggedUserId),
            isFavorite: grp.favoriteBy.includes(loggedUserId),
            draft: grp.drafts.find(d => d.user.toString() === loggedUserId.toString())?.text || ""
        };
    }));

    // --- 3. ARCHIVED CHATS ---
    const archivedDirect = await Conversation.find({
        participants: loggedUserId,
        archivedBy: loggedUserId
    })
    .populate("participants", "username profileName profilePic status isOnline")
    .populate("lastMessage")
    .sort({ lastActivity: -1 });

    const archivedDirectList = await Promise.all(archivedDirect.map(async (conv) => {
        const counter = await UnreadCounter.findOne({ user: loggedUserId, conversation: conv._id });
        const recipient = conv.participants.find(p => p._id.toString() !== loggedUserId.toString());
        return {
            _id: conv._id,
            type: "direct",
            recipient: recipient || { username: "Ghost", profileName: "ghost" },
            lastMessage: conv.lastMessage,
            lastActivity: conv.lastActivity,
            unreadCount: counter ? counter.unreadCount : 0,
            isArchived: true
        };
    }));

    const archivedGroups = await Group.find({
        "members.user": loggedUserId,
        archivedBy: loggedUserId
    })
    .sort({ lastActivity: -1 });

    const archivedGroupsList = await Promise.all(archivedGroups.map(async (grp) => {
        const counter = await UnreadCounter.findOne({ user: loggedUserId, group: grp._id });
        const lastMsg = await Message.findOne({ group: grp._id })
            .populate("sender", "username profileName")
            .sort({ createdAt: -1 });

        return {
            _id: grp._id,
            type: "group",
            name: grp.name,
            avatar: grp.avatar,
            lastMessage: lastMsg,
            lastActivity: grp.lastActivity,
            unreadCount: counter ? counter.unreadCount : 0,
            isArchived: true
        };
    }));

    // --- 4. REQUESTS (Group invites and incoming group requests) ---
    const invites = await GroupInvite.find({ invitee: loggedUserId, status: "pending" })
        .populate("group", "name avatar description")
        .populate("inviter", "username profileName profilePic");

    const myAdminGroups = await Group.find({
        members: {
            $elemMatch: {
                user: loggedUserId,
                role: { $in: ["owner", "admin"] }
            }
        },
        "joinRequests.0": { $exists: true }
    })
    .populate("joinRequests", "username profileName profilePic");

    let joinRequests = [];
    myAdminGroups.forEach(grp => {
        grp.joinRequests.forEach(reqUser => {
            joinRequests.push({
                _id: `${grp._id}_${reqUser._id}`,
                group: {
                    _id: grp._id,
                    name: grp.name,
                    avatar: grp.avatar
                },
                user: reqUser,
                type: "join_request"
            });
        });
    });

    res.status(200).json({
        direct: directList,
        groups: groupsList,
        archived: [...archivedDirectList, ...archivedGroupsList],
        requests: {
            invites,
            joinRequests
        }
    });
});

// Toggle Pin Status on Conversation or Group
const togglePin = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params; // conversationId or groupId
    const { type } = req.query; // "direct" or "group"

    if (type === "group") {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isPinned = group.pinnedBy.includes(loggedUserId);
        if (isPinned) {
            group.pinnedBy = group.pinnedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            group.pinnedBy.push(loggedUserId);
        }
        await group.save();
        return res.status(200).json({ pinned: !isPinned, id });
    } else {
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        const isPinned = conv.pinnedBy.includes(loggedUserId);
        if (isPinned) {
            conv.pinnedBy = conv.pinnedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            conv.pinnedBy.push(loggedUserId);
        }
        await conv.save();
        return res.status(200).json({ pinned: !isPinned, id });
    }
});

// Toggle Archive Status
const toggleArchive = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params;
    const { type } = req.query;

    if (type === "group") {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isArchived = group.archivedBy.includes(loggedUserId);
        if (isArchived) {
            group.archivedBy = group.archivedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            group.archivedBy.push(loggedUserId);
        }
        await group.save();
        return res.status(200).json({ archived: !isArchived, id });
    } else {
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        const isArchived = conv.archivedBy.includes(loggedUserId);
        if (isArchived) {
            conv.archivedBy = conv.archivedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            conv.archivedBy.push(loggedUserId);
        }
        await conv.save();
        return res.status(200).json({ archived: !isArchived, id });
    }
});

// Toggle Mute Status
const toggleMute = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params;
    const { type } = req.query;

    if (type === "group") {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isMuted = group.mutedBy.includes(loggedUserId);
        if (isMuted) {
            group.mutedBy = group.mutedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            group.mutedBy.push(loggedUserId);
        }
        await group.save();
        return res.status(200).json({ muted: !isMuted, id });
    } else {
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        const isMuted = conv.mutedBy.includes(loggedUserId);
        if (isMuted) {
            conv.mutedBy = conv.mutedBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            conv.mutedBy.push(loggedUserId);
        }
        await conv.save();
        return res.status(200).json({ muted: !isMuted, id });
    }
});

// Toggle Favorite Status
const toggleFavorite = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params;
    const { type } = req.query;

    if (type === "group") {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isFav = group.favoriteBy.includes(loggedUserId);
        if (isFav) {
            group.favoriteBy = group.favoriteBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            group.favoriteBy.push(loggedUserId);
        }
        await group.save();
        return res.status(200).json({ favorite: !isFav, id });
    } else {
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        const isFav = conv.favoriteBy.includes(loggedUserId);
        if (isFav) {
            conv.favoriteBy = conv.favoriteBy.filter(uid => uid.toString() !== loggedUserId.toString());
        } else {
            conv.favoriteBy.push(loggedUserId);
        }
        await conv.save();
        return res.status(200).json({ favorite: !isFav, id });
    }
});

// Save or clear input Drafts
const saveDraft = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params;
    const { type } = req.query;
    const { text } = req.body; // text content of the draft (or empty string to clear)

    if (type === "group") {
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Filter out existing draft
        group.drafts = group.drafts.filter(d => d.user.toString() !== loggedUserId.toString());
        if (text && text.trim() !== "") {
            group.drafts.push({ user: loggedUserId, text, updatedAt: Date.now() });
        }
        await group.save();
        res.status(200).json({ message: "Draft saved", draft: text, id });
    } else {
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        conv.drafts = conv.drafts.filter(d => d.user.toString() !== loggedUserId.toString());
        if (text && text.trim() !== "") {
            conv.drafts.push({ user: loggedUserId, text, updatedAt: Date.now() });
        }
        await conv.save();
        res.status(200).json({ message: "Draft saved", draft: text, id });
    }
});

// Mark conversation/group as read
const markAsRead = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { id } = req.params; // conversationId or groupId
    const { type } = req.query; // "direct" or "group"

    if (type === "group") {
        // Mark all group messages as read (add user to seenBy array)
        await Message.updateMany(
            { group: id, "seenBy.user": { $ne: loggedUserId } },
            { $push: { seenBy: { user: loggedUserId, seenAt: Date.now() } } }
        );

        // Reset Group unread counter
        await UnreadCounter.findOneAndUpdate(
            { user: loggedUserId, group: id },
            { $set: { unreadCount: 0 } },
            { upsert: true, new: true }
        );
        
        res.status(200).json({ message: "Group marked as read", id });
    } else {
        // Find conversation details to get other participant
        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ message: "Conversation not found" });

        const recipientId = conv.participants.find(p => p.toString() !== loggedUserId.toString());

        // Mark all messages from the recipient in this conversation as read
        await Message.updateMany(
            { conversation: id, sender: recipientId, isRead: false },
            { $set: { isRead: true } }
        );

        // Reset Conversation unread counter
        await UnreadCounter.findOneAndUpdate(
            { user: loggedUserId, conversation: id },
            { $set: { unreadCount: 0 } },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Conversation marked as read", id });
    }
});

module.exports = {
    getSidebarConversations,
    togglePin,
    toggleArchive,
    toggleMute,
    toggleFavorite,
    saveDraft,
    markAsRead
};
