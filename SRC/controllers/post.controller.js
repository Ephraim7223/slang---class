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

export const getAllPosts = async (req, res) => {
  try {
    const post = await Post.find()
    if (!post) {
      console.log('NO posts in database')
      return res.status(404).json({message: 'NO posts in database'})
    }
      res.status(200).json({message: 'Posts found successfully', post})
  } catch (error) {
    res.status(500)
    console.log(error);
    throw new error
  }
}

export const getSinglePost = async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.id)
    if (!singlePost) {
      console.log('NO post in database')
      res.status(404).json({message: 'NO post in database'})
      // throw new error 
    } else {
      res.status(200).json({message: 'Posts found successfully', singlePost})
    }
  } catch (error) {
    res.status(500)
    console.log(error);
    throw new error
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
     return res.status(404).json({message: 'NO post with such id existing'})
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
     return res.status(401).json({message: 'You cannot delete a post you did not create:: you fool!!! 🐸🐸🐸🐸🐸'})
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId)
    }
    await Post.findByIdAndDelete(post)
    res.status(200).json({message: 'Post deleted successfully'})
  } catch (error) {
    res.status(500).json({message: "internal server error"})
    console.log(error);
  }
}