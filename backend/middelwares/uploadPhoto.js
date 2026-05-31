const path = require("path");
const multer = require("multer");
const fs = require("fs");

const os = require("os");

// Use the OS temporary directory, which is guaranteed to exist and be writable in serverless environments like Vercel
const tmpDir = os.tmpdir();

const photoStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, tmpDir);
    },
    filename: function(req, file, cb) {
        if (file) {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            cb(null, `${timestamp}-${file.originalname}`);
        } else {
            cb(null, false);
        }
    }
});

const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function(req, file, cb) {
        const allowedTypes = [
            "image/", 
            "video/", 
            "audio/", 
            "application/pdf", 
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain", 
            "application/zip",
            "application/x-zip-compressed"
        ];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
        if (isAllowed) {
            cb(null, true);
        } else {
            cb({ message: 'File format not supported! Only images, videos, audio, and standard documents (PDF, Doc, TXT, ZIP) are allowed.' }, false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = photoUpload;
