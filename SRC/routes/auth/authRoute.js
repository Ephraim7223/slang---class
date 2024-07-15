import express from "express";
const router = express.Router()
import { signUp,signIn, forgotPassword, logout, adminSignIn } from "../../controllers/auth.Controller.js";
import upload from "../../config/multer.js";

router.post('/signup', upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), signUp);
router.post("/login", signIn)
router.post("/send-otp", forgotPassword)
router.post('/logout', logout);
router.post('/signin', adminSignIn)

export default router;
