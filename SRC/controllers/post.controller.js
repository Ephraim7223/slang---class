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
    const { text, img } = req.body;
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
      return res.status(400).json({ error: `Text should not exceed ${maxlength} characters 🐸🐸🐸🐸` });
    }

    let imgUrl = img;
    if (img) {
      const uploadedImg = await cloudinary.uploader.upload(img);
      imgUrl = uploadedImg.secure_url;
    }

    const newPost = new Post({
      postedBy,
      img: imgUrl,
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
    const posts = await Post.find();
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts in database' });
    }
    res.status(200).json({ message: 'Posts found successfully', posts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.id);
    if (!singlePost) {
      return res.status(404).json({ message: 'No post in database' });
    }
    res.status(200).json({ message: 'Post found successfully', singlePost });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'No post with such ID exists' });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'You cannot delete a post you did not create: you fool!!! 🐸🐸🐸🐸🐸' });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(post);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const { profilePic: userProfilePic, username } = req.user;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };
    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
};
