import express from "express";
import protectRoute from "../../middlewares/protectRoute.js";
import { getConversations, sendMessage } from "../../controllers/message.Controller.js";
const router  = express.Router()

router.post('/:recepientId', protectRoute, sendMessage)
router.get('/conversations', protectRoute, getConversations)

export default router;