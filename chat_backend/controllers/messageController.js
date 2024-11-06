const Group = require('../models/group');
const Message = require('../models/Message');
const User = require("../models/User");
const socketIO = require('../SocketEvent');
const mongoose = require("mongoose"); 

exports.sendMessage = async (req, res) => {
  const formatFileSize = (sizeInBytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    const size = Math.round(sizeInBytes / Math.pow(1024, index));
    return `${size} ${units[index]}`;
  };

  let { text, receiverId, groupId } = req.body;
  const senderId = req.userId;
  const file = req.file;
  
  if (receiverId === "undefined") {
    receiverId = null;
  } else if ( groupId === "undefined") groupId = null;
  try {
    const message = await Message.create({
      text,
      sender: senderId,
      receiver: receiverId,
      groupId: groupId,
      type: groupId? "group": "private",
      file: file ? {
        path: `/uploads/${req.file.filename}`,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: formatFileSize(file.size)
      } : null
    });

    // Manually populate sender and receiver usernames
    const sender = await User.findById(senderId).select("_id username");

    const formattedMessage = {
      text: message.text,
      type: message.type,
      file,
      sender,
      timestamp: message.timestamp.toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }),
    };

    
    if (receiverId) {
      const receiver = await User.findById(receiverId).select("_id username");
      socketIO.to(receiverId).to(senderId).emit("private-message", {...formattedMessage, receiver});
    } else if (groupId) {
      console.log(" hello world");
      const group = await Group.findById(groupId).select("_id name");
      socketIO.to(groupId).emit("group-message", {...formattedMessage, group});
    }
    res.send('Message sent successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending message');
  }
};

exports.getMessages = async (req, res) => {
  const { receiverId, groupId } = req.query;
  const senderId = req.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      groupId,
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
};

exports.getChats = async (req, res) => {
  const userId = req.userId;

  try {
    const chats = await Message.aggregate([
      {
        $facet: {
          "groupMessages": [
            {
              $match: {
                type: "group",
                groupId: { $ne: null }
              }
            },
            {
              $lookup: {
                from: "groups",
                localField: "groupId",
                foreignField: "_id",
                as: "groupInfo"
              }
            },
            {
              $unwind: "$groupInfo"
            },
            {
              $match: {
                "groupInfo.members": { $in: [new mongoose.Types.ObjectId(userId)] }
              }
            },
            {
              $group: {
                _id: "$groupId",
                type: {$first: "$type"},
                chatName: {$first: "$groupInfo.name"},
                lastMessage: { $last: '$text' },
                lastTimestamp: { $last: '$timestamp' },
              },
            },

          ],
          "privateMessages": [
            {
              $match: {
                type: "private",
                $or: [
                  { sender: new mongoose.Types.ObjectId(userId) },
                  { receiver: new mongoose.Types.ObjectId(userId) }
                ]
              }
            },
            {
              $group: {
                _id: {$cond: [{ $eq: ['$sender', new mongoose.Types.ObjectId(userId)] }, "$receiver", "$sender"]},
                type: {$first: '$type'},
                lastMessage: { $last: '$text' },
                lastTimestamp: { $last: '$timestamp' },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $unwind: "$user"
            },
            {
              $set: {
                chatName: "$user.username",
              }
            },
            {
              $unset: "user"
            }
          ]
        }
      },
      {
        $project: {
          mergedMessages: {
            $concatArrays: ["$groupMessages", "$privateMessages"]
          }
        }
      },
      {
        $unwind: "$mergedMessages"
      },
      {
        $replaceWith: "$mergedMessages"
      },
      {
        $sort: { lastTimestamp: -1 },
      },
      {
        $set: {
          lastTimestamp: {
            $cond: {
              if: { $gt: [{ $dateDiff: { startDate: "$lastTimestamp", endDate: "$currentDate", unit: "hour" } }, 24] },
              then: { $dateToString: { format: "%d/%m/%Y", date: "$lastTimestamp" } },
              else: {
                $concat: [
                  { $toString: { $hour: "$lastTimestamp" } },
                  ":",
                  { $toString: { $minute: "$lastTimestamp" } }
                ]
              }
            }
          },
        },
      },
    ]);
    res.json(chats);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    await Message.findByIdAndDelete(messageId);

    socketIO.emit('message-deleted', {
      messageId,
    });

    res.send('Message deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting message');
  }
};

exports.getMessagesHistory = async (req, res) => {
  const senderId = req.userId;
  const receiverId = req.params.receiverId;

  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ]
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver',
        }
      },
      {
        $unwind: '$receiver'
      },
      {
        $project: {
          _id: 1,
          sender: {_id: '$sender._id', username: '$sender.username'},
          receiver: {_id: '$receiver._id', username: '$receiver.username'},
          text: 1,
          type: 1,
          file: 1,
          timestamp: {
            $concat: [
              { $toString: { $hour: "$timestamp" } },
              ":",
              { $toString: { $minute: "$timestamp" } }
            ]
          }
        }
      },
    ]);
    res.json(messages);

  } catch (error) {
    res.status(501).json({ message: 'Error fetching messages' });
  }
};

exports.groupMessages = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const messages = await Message.aggregate([
      {
        $match: {groupId: groupId},
      },
      {
        $sort: {timestamp: 1},
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        }
      },
      {
        $unwind: "$sender",
      },
      {
        $project: {
          _id: 1,
          sender: {_id: '$sender._id', username: '$sender.username'},
          text: 1,
          type: 1,
          file: 1,
          timestamp: {
            $concat: [
              { $toString: { $hour: "$timestamp" } },
              ":",
              { $toString: { $minute: "$timestamp" } }
            ]
          }
        }
      },
    ]);
    res.json(messages);
  } catch (error) {
    console.log(error);
  }
}
