import express from "express";
import { deleteAllUsers, deleteSingleUser, followAndUnfollow, freezeAccount, getAllUsers, getSingleUser, getSuggestedUsers, updateCoverPhoto, updatePassword, updateProfilePic, updateUser } from "../../controllers/user.Controller.js";
import protectRoute from "../../middlewares/protectRoute.js";
import { payForBlueTick, verifyPayment } from "../../controllers/payment.js";
import { checkAdminRole } from "../../middlewares/checkAdminRole.js";
import upload from "../../config/multer.js";
const router = express.Router()

router.get("/", getAllUsers)
router.get("/:id", protectRoute,getSingleUser)
router.delete("/delete-all", deleteAllUsers)
router.patch('/update/:id', updateUser)
router.delete("/delete/:id", deleteSingleUser)
router.post("/suggestions", protectRoute, getSuggestedUsers)
router.post("/follow/:id", protectRoute, followAndUnfollow);
router.put("/freeze/:id", checkAdminRole('admin'), freezeAccount);
router.post('/pay-for-blue-tick', protectRoute, payForBlueTick);
router.get('/verify-payment', protectRoute, verifyPayment);
router.put('/profile-pic', upload.single('profilePic'), updateProfilePic);
router.put('/cover-photo', upload.single('coverPhoto'), updateCoverPhoto);
router.post('/update-password', protectRoute, updatePassword);


export default router