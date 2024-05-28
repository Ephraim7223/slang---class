import express from "express";
import { createPost, deletePost, getAllPosts, getSinglePost } from "../../controllers/post.controller.js";
import protectRoute from "../../middlewares/protectRoute.js";
const router = express.Router()


router.post("/add", protectRoute ,createPost)
router.get("/", protectRoute, getAllPosts)
router.get("/:id", protectRoute, getSinglePost)
router.delete("/:id", protectRoute, deletePost)

export default router