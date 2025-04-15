const generateToken = require("../config/tokenGenerate.js");
const {User , validateUpdate , validateUser , validateLogin} = require("../modules/User.js");
const bcrypt = require("bcrypt");
// const cloudinary = require("../lib/cloudinary.js");
const asynchandler = require('express-async-handler')
const jwt = require("jsonwebtoken");
const { cloudUpload, cloudRemove } = require("../utils/cloudinary.js");
const fs = require('fs')
const path = require('path')

const signup = asynchandler(async (req, res) => {
    const { error } = validateUser(req.body);

    if (error) return res.status(400).json({ message: error.details[0].message });
    
    const user = await User.findOne({ email : req.body.email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username : req.body.username,
      email : req.body.email,
      password: hashedPassword,
    });
    const token = jwt.sign({ _id: newUser._id, isAdmin: newUser.isAdmin }, process.env.TOKEN_SECRET);
    const { password, ...others } = newUser._doc
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000
    })
    if (newUser) {
      // generate jwt token here
      await newUser.save();
      res.status(201).json({ ...others, token });
    }
});

const login = asynchandler(async (req, res) => {
  const { error } = validateLogin(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

  if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.TOKEN_SECRET);

  const { password, ...others } = user._doc;

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ ...others, token });
});

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllUsers = asynchandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
})

const getUserById = asynchandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json(user);
})

const updateUser = asynchandler(async (req, res) => {
  const {error} = validateUpdate(req.body);
  if (error) return res.status(400).json({message : error.details[0].message});
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
  }
  const newUserUpdate = await User.findByIdAndUpdate(req.params.id, {
      $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profileName: req.body.profileName,
          description: req.body.description
      }
    }, { new: true })
    res.status(200).json(newUserUpdate);
})

/**
 * @desc    Upload Profile Photo
 * @route   POST /api/auth/photo
 * @access  private (only user logged)
 * @method  POST
 */


const uploadPhoto = asynchandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({message : "No file uploaded"})
    }
    // Get image 
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    // Upload Image
    const result = await cloudUpload(imagePath)
    // console.log(req.user)
    const user = await User.findById(req.user._id)
    if(user.profilePic.publicId !== null){
        await cloudRemove(user.profilePic.publicId)
    }
    user.profilePic = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save()
    // console.log(result)
    res.status(200).json({
            url: result.secure_url
            , publicId: result.public_id
    })
    fs.unlinkSync(imagePath)
})


module.exports = {signup, login , logout , getAllUsers , getUserById , updateUser , uploadPhoto};