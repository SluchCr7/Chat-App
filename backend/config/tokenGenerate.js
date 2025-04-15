const jwt =require("jsonwebtoken");

const generateToken = (userId,isAdmin, res) => {
  const token = jwt.sign({ userId , isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "None",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

module.exports = generateToken