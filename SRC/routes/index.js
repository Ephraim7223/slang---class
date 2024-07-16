import express from "express";
import authRoute from '../routes/auth/authRoute.js'
import userRoute from '../routes/user/userRoute.js'
import postRoute from '../routes/post/postRoute.js'
import messageRoute from '../routes/messages/messageRoute.js'
import reportRoute from '../routes/report/reportRoute.js';

const router = express.Router()

router.use('/auth', authRoute)
router.use('/user', userRoute)
router.use('/post', postRoute)
router.use('/messages', messageRoute)
router.use('/report', reportRoute);

export default router;