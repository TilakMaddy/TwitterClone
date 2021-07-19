const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({

  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, trim: true},
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps : true }) // createdAt, updatedAt field is automatically added

module.exports = mongoose.model('Message', MessageSchema);