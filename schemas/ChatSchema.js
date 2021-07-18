const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ChatSchema = new Schema({

  chatName: { type: String, trim: true},
  isGroupChat: { type: Boolean, default: false}, // one to one isnt group chat
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' },

}, { timestamps : true }) // createdAt, updatedAt field is automatically added

module.exports = mongoose.model('Chat', ChatSchema);