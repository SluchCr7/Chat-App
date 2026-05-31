const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
};

const verifyAdmain = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }
    });
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        const userId = req.user._id || req.user.id;
        if (req.user && userId === req.params.id) {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Action unauthorized." });
        }
    });
};

const verifyAdmainUser = (req, res, next) => {
    verifyToken(req, res, () => {
        const userId = req.user._id || req.user.id;
        if (req.user && (userId === req.params.id || req.user.isAdmin)) {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Action unauthorized." });
        }
    });
};

module.exports = { verifyToken, verifyAdmain, verifyUser, verifyAdmainUser };