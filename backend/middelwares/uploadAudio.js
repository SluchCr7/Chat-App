const multer = require("multer");
const os = require("os");

const tmpDir = os.tmpdir();

const audioStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, tmpDir);
    },
    filename: function(req, file, cb) {
        if (file) {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            cb(null, `audio-${timestamp}-${file.originalname}`);
        } else {
            cb(null, false);
        }
    }
});

const audioUpload = multer({
    storage: audioStorage,
    fileFilter: function(req, file, cb) {
        const allowedTypes = [
            "audio/", 
            "video/webm", // MediaRecorder records audio inside webm container in Chrome/Firefox
            "audio/webm",
            "audio/ogg",
            "audio/wav",
            "audio/mp3",
            "audio/mpeg",
            "audio/m4a",
            "audio/x-m4a",
            "audio/mp4",
            "audio/aac",
            "audio/x-aac"
        ];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('File format not supported! Only audio files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = audioUpload;
