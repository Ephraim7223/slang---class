import express from "express";
const router = express.Router()
import { deleteAllUsers, deleteSingleUser, getAllUsers, getSingleUser, updateUser } from "../../controllers/userController.js";

router.get("/", getSingleUser)
router.get("/:id", getAllUsers)
router.delete("/:id", deleteSingleUser)
router.delete("/delete", deleteAllUsers)
router.patch('/update-user', updateUser)

export default router