const jwt = require("jsonwebtoken");
const { getJwtSecret, getRefreshTokenSecret } = require("../config/jwtSecret.js");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      isAdmin: user.isAdmin,
    },
    getJwtSecret()
    // {
    //   expiresIn: "15m",
    // }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    getRefreshTokenSecret(),
    {
      expiresIn: "30d",
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};