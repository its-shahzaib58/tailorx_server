require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const router = express.Router();
// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "uploads", "logos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload-logo", upload.single("logo"), async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    user.logoUrl = logoUrl;
    await user.save();

    res.json({ message: "Logo uploaded successfully", logoUrl });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/details", async (req, res) => {
  const id = req.session.userId;
  // console.log(id)
  try {
    const user = await User.findById(id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", async (req, res) => {
  const userId = req.session.userId;
  const { logoUrl, b_name, name, email, phone_no, address, website } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.logoUrl = logoUrl ?? user.logoUrl;
    user.b_name = b_name ?? user.b_name;
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone_no = phone_no ?? user.phone_no;
    user.address = address ?? user.address;
    user.website = website ?? user.website;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

module.exports = router;
