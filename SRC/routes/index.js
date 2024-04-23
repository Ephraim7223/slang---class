import express from "express";
import authRoute from '../routes/auth/authRoute.js'
import userRoute from '../routes/user/userRoute.js'
const router = express.Router()

router.use('/auth', authRoute)
router.use('/user', userRoute)

export default router;