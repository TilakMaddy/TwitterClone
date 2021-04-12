const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({

  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  username: {
    unique: true,
    type: String,
    required: true,
    trim: true,
  },

  email: {
    unique: true,
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  profilePic: {
    type: String,
    default: "/images/profilePic.jpg"
  }

}, { timestamps: true }) // createdAt, updatedAt field is automatically added

var User = mongoose.model('User', UserSchema)
module.exports = User