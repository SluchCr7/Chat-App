const route = require("express").Router();
const { verifyToken } = require("../middelwares/verifyToken.js");
const audioUpload = require("../middelwares/uploadAudio.js");
const { uploadAudio } = require("../Controller/messageController.js");

// Endpoint for voice recording uploads
route.post("/upload-audio", verifyToken, audioUpload.single("audio"), uploadAudio);

module.exports = route;
