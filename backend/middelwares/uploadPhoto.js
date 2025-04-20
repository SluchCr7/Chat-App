const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Ensure the temp directory exists (some environments might not pre-create it)
const tmpDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

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
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: 'Only .png, .jpg and .jpeg format allowed!' }, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 // 1MB limit
    }
});

module.exports = photoUpload;
