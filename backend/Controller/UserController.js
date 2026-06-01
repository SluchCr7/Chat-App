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
    
    const normalizedProfileName = req.body.profileName.toLowerCase().replace(/^@/, '');

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).json({ message: "Email already exists" });

    const profileNameExists = await User.findOne({ profileName: normalizedProfileName });
    if (profileNameExists) return res.status(400).json({ message: "Profile name already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username : req.body.username,
      profileName: normalizedProfileName,
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
    res.cookie("token", "", { maxAge: 0, httpOnly: true, secure: true, sameSite: 'None' });
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true, secure: true, sameSite: 'None' });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllUsers = asynchandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { profileName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    users,
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.ceil(total / Number(limit)),
  });
});

const getUserById = asynchandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
});

const updateUser = asynchandler(async (req, res) => {
  const {error} = validateUpdate(req.body);
  if (error) return res.status(400).json({message : error.details[0].message});
  
  const updateData = {};
  if (req.body.username) updateData.username = req.body.username;
  if (req.body.email) updateData.email = req.body.email;
  if (req.body.profileName) {
    const normalizedProfileName = req.body.profileName.toLowerCase().replace(/^@/, '');
    const profileNameExists = await User.findOne({ profileName: normalizedProfileName, _id: { $ne: req.params.id } });
    if (profileNameExists) return res.status(400).json({ message: 'Profile name already exists' });
    updateData.profileName = normalizedProfileName;
  }
  if (req.body.description) updateData.description = req.body.description;
  
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    updateData.password = hashedPassword;
  }
  
  // Custom features
  if (req.body.status) updateData.status = req.body.status;
  if (req.body.socialLinks) updateData.socialLinks = req.body.socialLinks;
  if (req.body.bannerPic) updateData.bannerPic = req.body.bannerPic;

  const newUserUpdate = await User.findByIdAndUpdate(req.params.id, {
      $set: updateData
    }, { new: true }).select("-password");
    
  res.status(200).json(newUserUpdate);
});

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
    const imagePath = req.file.path;
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

const toggleBlockUser = asynchandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { userId } = req.params;

    if (loggedUserId.toString() === userId.toString()) {
        return res.status(400).json({ message: "You cannot block yourself" });
    }

    const me = await User.findById(loggedUserId);
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const isBlocked = me.blockedUsers.includes(userId);
    if (isBlocked) {
        me.blockedUsers = me.blockedUsers.filter(uid => uid.toString() !== userId.toString());
    } else {
        me.blockedUsers.push(userId);
    }
    await me.save();
    
    const { Contact } = require("../modules/Contact");
    await Contact.deleteMany({
        $or: [
            { user: loggedUserId, contact: userId },
            { user: userId, contact: loggedUserId }
        ]
    });

    res.status(200).json({ blocked: !isBlocked, message: isBlocked ? "User unblocked successfully" : "User blocked successfully" });
});

const reportItem = asynchandler(async (req, res) => {
    const loggedUserId = req.user._id;
    const { reportedUserId, messageId, reason } = req.body;

    if (!reportedUserId || !reason) {
        return res.status(400).json({ message: "reportedUserId and reason are required" });
    }

    const { Report } = require("../modules/Report");
    const newReport = new Report({
        reporter: loggedUserId,
        reportedUser: reportedUserId,
        message: messageId || undefined,
        reason
    });

    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully", report: newReport });
});

module.exports = {signup, login , logout , getAllUsers , getUserById , updateUser , uploadPhoto, toggleBlockUser, reportItem};