const { getUsersInSideBar, getMessages  , sendMessage} = require("../Controller/messageController")
const { verifyToken } = require("../middelwares/verifyToken.js");
const photoUpload = require("../middelwares/uploadPhoto.js");
const route = require("express").Router();
route.route("/users")
    .get(verifyToken, getUsersInSideBar);

route.route("/:id")
    .get(verifyToken, getMessages);

route.route("/send/:id")
    .post(verifyToken, photoUpload.fields([{ name: 'image', maxCount: 8 }]), sendMessage);

module.exports = route