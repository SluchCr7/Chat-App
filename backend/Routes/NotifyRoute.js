const { addNewNotify, getAllNotify, deleteNotify , getAllNotificationsByUser } = require("../Controller/notificationController")
const { verifyToken } = require("../middelwares/verifyToken.js");
const route = require("express").Router();
route.route("/")
    .get(getAllNotify)
route.route("/:id")
    .delete(verifyToken, deleteNotify)
route.route("/send/:id")
    .post(verifyToken, addNewNotify)
route.route("/user")
    .get(verifyToken, getAllNotificationsByUser)

module.exports = route