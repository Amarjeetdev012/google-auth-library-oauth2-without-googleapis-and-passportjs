import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  tokenExpiryDate: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);

export const findUser = async (id) => {
  return await User.findOne({ googleId: id });
};

export const createUser = async (user) => {
  return await User.create(user);
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete({ _id: id });
};
