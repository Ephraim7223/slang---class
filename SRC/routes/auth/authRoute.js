import express from "express";
const router = express.Router()
import { signUp,signIn, forgotPassword } from "../../controllers/auth.Controller.js";

router.post("/register",signUp)
router.post("/login", signIn)
router.post("/send-otp", forgotPassword)

export default router;
