const express = require("express");
const route = express.Router();
const {login, logout, signup, getAllUsers , getUserById , updateUser , uploadPhoto } = require("../Controller/UserController.js");
const {verifyToken} = require("../middelwares/verifyToken.js");
const photoUpload = require("../middelwares/uploadPhoto.js");
route.route("/register")
    .post(signup);
route.route("/login")
    .post(login);
route.route("/logout")
    .post(verifyToken, logout);
route.route("/")
    .get(getAllUsers);
route.route("/:id")
    .get(getUserById)
route.route("/profile/:id")
    .put(verifyToken, updateUser);
route.route("/upload")
    .post(verifyToken, photoUpload.single("image"), uploadPhoto);
    
module.exports = route;