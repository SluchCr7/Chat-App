const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middelwares/verifyToken.js");
const {
    getSidebarConversations,
    togglePin,
    toggleArchive,
    toggleMute,
    toggleFavorite,
    saveDraft,
    markAsRead
} = require("../Controller/ConversationController");

router.route("/")
    .get(verifyToken, getSidebarConversations);

router.route("/pin/:id")
    .put(verifyToken, togglePin);

router.route("/archive/:id")
    .put(verifyToken, toggleArchive);

router.route("/mute/:id")
    .put(verifyToken, toggleMute);

router.route("/favorite/:id")
    .put(verifyToken, toggleFavorite);

router.route("/draft/:id")
    .put(verifyToken, saveDraft);

router.route("/read/:id")
    .post(verifyToken, markAsRead);

module.exports = router;
