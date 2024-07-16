import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  coverPhoto: {
    type: String,
    default: '' 
  },
  bio: {
    type: String,
  },
  following: {
    type: [String],
    default: []
  },
  followers: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'male', 'female', 'Frog'],
    required: true
  },
  loginID: {
    type: String,
  },
  otp: {
    type: String,
    default: null,
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  blueTickExpiresAt: {
    type: Date,
    default: null
  },
  yellowTickExpiresAt: {
    type: Date,
    default: null
  },
  greenTickExpiresAt: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
