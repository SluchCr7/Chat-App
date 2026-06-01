const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middelwares/verifyToken.js");
const {
    searchUsers,
    addContact,
    getContacts,
    removeContact
} = require("../Controller/ContactController");

router.route("/search")
    .get(verifyToken, searchUsers);

router.route("/")
    .get(verifyToken, getContacts)
    .post(verifyToken, addContact);

router.route("/:contactId")
    .delete(verifyToken, removeContact);

module.exports = router;
