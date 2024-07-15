import User from "../models/user.model.js"
import cryptoHash from 'crypto';
import { frozenAccountTemplate } from "../templates/frozenAccountTemplate.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function hashValue(value) {
    const hash = cryptoHash.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
}

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find()
        if (!allUsers) {
        res.status(400).json({message: 'No users found in database'})
    }   else {
        res.status(200).json({message: 'Users found successfully', allUsers})
    }
    }   catch (error) {
        console.error('Error while getting all users:',error);
        res.status(500).json({message: error.messaage})
    }
}

export const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id
        const singleUser = await User.findById(userId)
        if (!singleUser) {
        res.status(400).json({message: `No user with such id:${userId} found`})
    }   else {
        res.status(200).json({message: 'User found successfully', singleUser})
    }
    }   catch (error) {
        console.error('Error while getting single user',error);
        res.status(500).json({message: error.messaage})
    }
}

export const deleteSingleUser = async (req, res) => {
    try {
        const userId = req.params.id
        const userToDelete = await User.findByIdAndDelete(userId)
        if (!userToDelete) {
            res.status(400).json({message: `No user with such id:${userId} found`})
        } else {
            res.status(200).json({message: 'User deleted successfully', userToDelete})
        }
    } catch (error) {
        console.error('Error while deleting user:',error);
        res.status(500).json({message: error.messaage})
    }
}

export const deleteAllUsers = async (req, res) => {
    try {
        const allUsers = await User.deleteMany()
        if (!allUsers) {
            res.status(400).json({message: 'No users found in database'})
        }   else {
            res.status(200).json({message: 'Users deleted successfully', allUsers})
        }
        }   catch (error) {
            console.error('Error while deleting all users:', error);
            res.status(500).json({message: error.messaage})
        }
}


export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password, ...rest } = req.body;

    if (password) {
      const hashedPassword = cryptoHash.createHash('sha256').update(password).digest('hex');

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...rest, password: hashedPassword },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: `User with id: ${userId} not found` });
      }

      return res.status(200).json({ message: 'User updated successfully', updatedUser });
    } else {
      const updatedUser = await User.findByIdAndUpdate(userId, rest, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: `User with id: ${userId} not found` });
      }

      return res.status(200).json({ message: 'User updated successfully', updatedUser });
    }
  } catch (error) {
    console.error('Error while updating User:', error);
    res.status(400).json({ message: error.message });
  }
};

export const freezeAccount = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isFrozen = true;
        await user.save();
        await frozenAccountTemplate(user.email, user.userName);
        res.status(200).json({ message: 'Account frozen successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

  

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const followAndUnfollow = async (req, res) => {
    try {
        const id = req.params.id
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id.toString()) {
            res.status(400).json({message: "You cannot follow/unfollow yourself"})
        }
        if (!userToModify || !currentUser) {
            res.status(404).json({message:'User not found'})
        }
        const isFollowing = currentUser.followers.includes(id)
        if (isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user_id, {$pull: {following:id}})
            res.status(200).json({message: "You have successfully unfollowed this user"})
        } else {
            // follow user
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user_id,{$push:{following:id}})
            res.status(200).json({message: "You have successfully followed this user"})
        }
    } catch (error) {
        console.log();
        res.status(500).json(error.message)
    }
}

export const updateProfilePic = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const oldProfilePicId = user.profilePic && user.profilePic.split('/').pop().split('.')[0];
      
      if (req.file) {
        const uploadedImg = await cloudinary.uploader.upload(req.file.path);
        const newProfilePicUrl = uploadedImg.secure_url;
  
        if (oldProfilePicId) {
          await cloudinary.uploader.destroy(oldProfilePicId);
        }
  
        user.profilePic = newProfilePicUrl;
        await user.save();
  
        res.status(200).json({ message: 'Profile picture updated successfully', user });
      } else {
        res.status(400).json({ message: 'No file uploaded' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };
  
  export const updateCoverPhoto = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const oldCoverPhotoId = user.coverPhoto && user.coverPhoto.split('/').pop().split('.')[0];
      
      if (req.file) {
        const uploadedImg = await cloudinary.uploader.upload(req.file.path);
        const newCoverPhotoUrl = uploadedImg.secure_url;
  
        if (oldCoverPhotoId) {
          await cloudinary.uploader.destroy(oldCoverPhotoId);
        }
  
        user.coverPhoto = newCoverPhotoUrl;
        await user.save();
  
        res.status(200).json({ message: 'Cover photo updated successfully', user });
      } else {
        res.status(400).json({ message: 'No file uploaded' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };

  export const updatePassword = async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await comparePasswords(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      const encryptedPassword = hashValue(newPassword);
  
      user.password = encryptedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };