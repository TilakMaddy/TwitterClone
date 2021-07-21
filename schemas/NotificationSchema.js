const mongoose = require('mongoose')

const Schema = mongoose.Schema

const NotificationsSchema = new Schema({

  userTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  userFrom: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  notificationType: String,

  opened: {type: Boolean, default: false},

  entityId: Schema.Types.ObjectId,


}, { timestamps: true }) // createdAt, updatedAt field is automatically added

NotificationsSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {

  var data = { userTo, userFrom, notificationType, entityId };

  await Notification.deleteOne(data).catch(console.log);

  return Notification.create(data).catch(console.log);

};

var Notification = mongoose.model('Notification', NotificationsSchema)
module.exports = Notification