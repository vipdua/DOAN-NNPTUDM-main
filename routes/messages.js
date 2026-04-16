var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let messageModel = require('../schemas/messages');
let userModel = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');

function getMessageContent(body) {
  if (body.file) {
    return {
      type: 'file',
      text: body.file
    };
  }

  if (body.type === 'file') {
    return {
      type: 'file',
      text: body.text
    };
  }

  return {
    type: 'text',
    text: body.text
  };
}

router.get('/', CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = new mongoose.Types.ObjectId(req.user._id);

    let latestMessages = await messageModel.aggregate([
      {
        $match: {
          $or: [
            { from: currentUserId },
            { to: currentUserId }
          ]
        }
      },
      {
        $addFields: {
          partnerId: {
            $cond: [
              { $eq: ['$from', currentUserId] },
              '$to',
              '$from'
            ]
          }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: '$partnerId',
          message: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$message'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    let populatedMessages = await messageModel.populate(latestMessages, [
      { path: 'from', select: 'username email fullName avatarUrl' },
      { path: 'to', select: 'username email fullName avatarUrl' }
    ]);

    res.send(populatedMessages);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get('/:userID', CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let otherUserId = req.params.userID;

    let existedUser = await userModel.findOne({ _id: otherUserId, isDeleted: false });
    if (!existedUser) {
      return res.status(404).send({ message: 'userID not found' });
    }

    let messages = await messageModel
      .find({
        $or: [
          { from: currentUserId, to: otherUserId },
          { from: otherUserId, to: currentUserId }
        ]
      })
      .populate('from', 'username email fullName avatarUrl')
      .populate('to', 'username email fullName avatarUrl')
      .sort({ createdAt: 1 });

    res.send(messages);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post('/:userID', CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let otherUserId = req.params.userID;

    let existedUser = await userModel.findOne({ _id: otherUserId, isDeleted: false });
    if (!existedUser) {
      return res.status(404).send({ message: 'userID not found' });
    }

    let messageContent = getMessageContent(req.body);

    if (!messageContent.text || !messageContent.text.trim()) {
      return res.status(400).send({ message: 'messageContent.text is required' });
    }

    let newMessage = new messageModel({
      from: currentUserId,
      to: otherUserId,
      messageContent: {
        type: messageContent.type,
        text: messageContent.text.trim()
      }
    });

    await newMessage.save();
    await newMessage.populate('from', 'username email fullName avatarUrl');
    await newMessage.populate('to', 'username email fullName avatarUrl');

    res.send(newMessage);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
