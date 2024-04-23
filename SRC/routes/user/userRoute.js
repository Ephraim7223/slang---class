import express from "express";
import { deleteAllUsers, deleteSingleUser, getAllUsers, getSingleUser, updateUser } from "../../controllers/userController.js";
const router = express.Router()

router.get("/", getAllUsers)
router.get("/:id", getSingleUser)
router.delete("/delete-all", deleteAllUsers)
router.patch('/update-user/:id', updateUser)
router.delete("/delete-single/:id", deleteSingleUser)

export default router