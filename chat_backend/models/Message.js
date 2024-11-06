const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');

mongoose.plugin(castAggregation); 


const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  read: {
    type: Boolean,
    default: false,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  file: {
    filename: String,
    mimetype: String,
    caption: String,
    size: String,
    path: String,
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;