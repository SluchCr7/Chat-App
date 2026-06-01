const asyncHandler = require("express-async-handler");
const { User } = require("../modules/User");
const { Contact } = require("../modules/Contact");

// Search users globally by profileName
const searchUsers = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return res.status(200).json([]);
    }

    const queryStr = q.trim().toLowerCase().replace(/^@/, "");

    // Find users we blocked or who blocked us
    const me = await User.findById(loggedUserId);
    const blockedByMe = me.blockedUsers || [];
    const blockedMe = await User.find({ blockedUsers: loggedUserId }).select("_id");
    const blockedMeIds = blockedMe.map(u => u._id);

    const excludedIds = [loggedUserId, ...blockedByMe, ...blockedMeIds];

    const matchingUsers = await User.find({
        _id: { $nin: excludedIds },
        profileName: { $regex: queryStr, $options: "i" }
    })
    .select("username profileName profilePic status isOnline description")
    .limit(20);

    res.status(200).json(matchingUsers);
});

// Add a user to Contacts
const addContact = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { contactId } = req.body;

    if (!contactId) {
        return res.status(400).json({ message: "Contact ID is required" });
    }

    if (loggedUserId.toString() === contactId.toString()) {
        return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    const targetUser = await User.findById(contactId);
    if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const existing = await Contact.findOne({ user: loggedUserId, contact: contactId });
    if (existing) {
        return res.status(400).json({ message: "User is already in your contacts list" });
    }

    const newContact = new Contact({ user: loggedUserId, contact: contactId });
    await newContact.save();

    res.status(201).json({ message: "Contact added successfully", contact: targetUser });
});

// Get all contacts of the current user
const getContacts = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;

    const contacts = await Contact.find({ user: loggedUserId })
        .populate("contact", "username profilePic profileName status isOnline description")
        .sort({ createdAt: -1 });

    const contactList = contacts.filter(c => c.contact !== null).map(c => c.contact);

    res.status(200).json(contactList);
});

// Remove a contact
const removeContact = asyncHandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { contactId } = req.params;

    const deleted = await Contact.findOneAndDelete({ user: loggedUserId, contact: contactId });
    if (!deleted) {
        return res.status(404).json({ message: "Contact not found in your list" });
    }

    res.status(200).json({ message: "Contact removed successfully" });
});

module.exports = {
    searchUsers,
    addContact,
    getContacts,
    removeContact
};
