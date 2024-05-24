import User from "../models/user.model.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const postedBy = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required: 🐸🐸🐸🐸🐸" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const maxlength = 1000;
    if (text.length > maxlength) {
      return res.status(400).json({ error:` Text should not exceed ${maxlength} characters 🐸🐸🐸🐸 `});
    }

    if (img) {
      const uploadedimg = await cloudinary.uploader.upload(img);
      img = uploadedimg.secure_url;
    }

    const newPost = new Post({
      postedBy,
      img,
      text
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully: 🐸🐸🐸🐸🐸', newPost });
    console.log('Post created successfully', newPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error('Internal server error:', error);
  }
};
