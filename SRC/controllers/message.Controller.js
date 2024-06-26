import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const {recepientId} = req.params
        const {message} = req.body
        const senderId = req.user._id

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, recepientId ]}
        })

        if (!conversation) {
            conversation = new Conversation({
                participants:[senderId, recepientId],
                lastMessage:{
                    text: message,
                    sender: senderId
                 }
            })
         await conversation.save()
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text : message
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage:{
                    text: message,
                    sender: senderId
                }
            })
        ])

        const recievedMessage = getRecipientSocketId(recepientId)
        if (recievedMessage) {
            io.to(recievedMessage).emit('newMessage', newMessage)
        }

        res.status(200).json(newMessage)
    } catch (error) {
        res.status(500).json(error.message)
        console.log(error);
    }
}

export const getConversations = async (req, res) => {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId}).populate({
            path: 'participants',
            select: 'username profilePic',
        });

        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            )
        })
        res.status(200).json(conversations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getMessage = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;
    try {
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        const recipientId = messages.length ? messages[0].conversationId.participants.find(id => id.toString() !== userId.toString()) : null;

        if (recipientId && recipientId.toString() === userId.toString()) {
            await Message.updateMany({ conversationId, sender: { $ne: userId }, isSeen: false }, { isSeen: true });
        }

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMessage = () => {}
export const updateMessage = () => {}