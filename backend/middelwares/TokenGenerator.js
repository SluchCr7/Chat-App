const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      isAdmin: user.isAdmin,
    },
    process.env.ACCESS_TOKEN_SECRET
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
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};