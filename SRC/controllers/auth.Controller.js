import cryptoHash from 'crypto';
import User from '../models/user.model.js';
import { signUpValidator, signInValidator } from '../validators/auth.validator.js';
import { formatZodError } from '../utils/errorMessage.js';
import generateTokenAndSetCookie from '../utils/generateTokenAndSetCookie.js';
import { generateRandomNumber } from '../utils/randomNumber.js';
import { successfullRegistration } from '../templates/successfullReg.js';
import { otpGeneration } from '../templates/otp.js';
import Admin from '../models/admin.model.js';
import cloudinaryMediaUpload from '../config/cloudinary.js';

function hashValue(value) {
    const hash = cryptoHash.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
}
 
 function comparePasswords(inputPassword, hashedPassword) {
    return hashValue(inputPassword) === hashedPassword;
}

export const signUp = async (req, res) => {
    const registerResults = signUpValidator.safeParse(req.body);
    if (!registerResults.success) {
      return res.status(400).json(formatZodError(registerResults.error.issues));
    }
  
    try {
      const { userName, phoneNumber, email } = req.body;
      let { name, password, confirmPassword, bio, gender } = req.body;
  
      const existingUser = await User.findOne({ $or: [{ userName }, { email }, { phoneNumber }] });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists', user: existingUser });
      }
  
      if (password !== confirmPassword) {
        return res.status(403).json({ message: 'Password and confirmPassword do not match' });
      }
  
      const encryption = hashValue(password);
      const userId = generateRandomNumber(7);
  
      let profilePic = '';
      let coverPhoto = '';
  
      if (req.file) {
        const uploadedImg = await cloudinaryMediaUpload(req.file.path, 'profile_pics');
        profilePic = uploadedImg.url;
      }
  
      if (req.files && req.files.coverPhoto) {
        const uploadedCoverImg = await cloudinaryMediaUpload(req.files.coverPhoto.path, 'cover_photos');
        coverPhoto = uploadedCoverImg.url;
      }
  
      const newUser = new User({
        name,
        userName,
        password: encryption,
        email,
        phoneNumber,
        profilePic,
        coverPhoto,
        loginID: userId,
        bio,
        gender
      });
  
      await successfullRegistration(newUser.email, newUser.userName, newUser.loginID);
      await newUser.save();
  
      res.status(200).json({ message: 'User registered successfully', newUser });
      console.log('User registered successfully', newUser);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };

  export const signIn = async (req, res, next) => {
    const loginResults = signInValidator.safeParse(req.body);
    if (!loginResults.success) {
        return res.status(400).json(formatZodError(loginResults.error.issues));
    }

    try {
        const { loginID, password } = req.body;
        const user = await User.findOne({ loginID });

        if (!user) {
            return res.status(400).json({ message: 'User with loginID not found' });
        }

        if (user.isFrozen) {
            return res.status(403).json({ message: 'Your account is frozen. Please contact support.' });
        }

        const comparePass = comparePasswords(password, user.password);
        if (!comparePass) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        const accessToken = generateTokenAndSetCookie(user._id, res);

        res.status(200).json({ message: 'User Login successful', accessToken });
        console.log('User Login successful', accessToken);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('INTERNAL SERVER ERROR', error.message);
    }
};

export const adminSignIn = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      const hashedPassword = hashValue(password);
      if (hashedPassword !== admin.password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      res.status(200).json({ message: 'Admin login successful' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const logout = async (req, res, next) => {
    try {
      res.clearCookie('jwt');
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };
  

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if (!user) {
            res.status(404).json({message: 'Email not found in db'})
        }
        const randomOtp = generateRandomNumber(7)
        user.otp = randomOtp
        await user.save()
        await otpGeneration(user.email, user.otp)
        res.status(200).json({message: 'Otp sent successfully'})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;

        const user = await User.findOne({ otp });

        if (!user) {
            return res.status(404).json({ message: 'Invalid OTP' });
        }

        user.password = newPassword;
        user.otp = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};