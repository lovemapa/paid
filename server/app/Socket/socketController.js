const messageModel = require("../../models/message")
const conversationModel = require("../../models/message")
const Constant = require('../../constants/constant')

const mongoose = require("mongoose");
const userModel = require('../../models/company')
const moment = require('moment')



class socketController {

    // Send Message to a group or particular user
    sendMessage(socket, io, socketInfo, room_members) {
        socket.on('sendMessage', (data) => {
            blockModel.findOne({ userId: data.to, opponentId: data.from }).then(block => {
                socket.username = data.username
                if (block)
                    data.isBlocked = true
                else
                    data.isBlocked = false

                const messageSchema = this.createMessageSchema(data, data.conversationId)

                messageSchema.save().then((result) => {
                    if (block) {
                        io.to(socket.id).emit('sendMessage', { success: Constant.TRUE, result: result, message: Constant.BLOCKMESSAGE })
                    }
                    else {
                        messageModel.populate(messageSchema, { path: "to from" }, function (err, populatedData) {

                            if (data.messageType == 'single') {
                                populatedData.set('chatName', populatedData.from, { strict: false })

                                io.to(socketInfo[data.to]).emit('listenMessage', { success: Constant.TRUE, result: populatedData })

                                let msg = populatedData.message
                                notif.sendUserNotification(data.from, data.to, msg, populatedData, 1, populatedData.from.firstName + ' ' + populatedData.from.lastName)
                            }
                            else {
                                groupModel.findOne({ _id: data.groupId }).then(result => {
                                    result.members.map(value => {
                                        if (String(value) != String(populatedData.from._id)) {
                                            populatedData.set('chatName', result, { strict: false })
                                            let obj = {}
                                            obj.from = populatedData.from
                                            obj.message = populatedData.message
                                            obj.messageType = populatedData.messageType
                                            obj.conversationId = populatedData.conversationId
                                            obj.type = populatedData.type
                                            obj.chatName = result
                                            obj.unreadCount = 0
                                            io.to(socketInfo[value]).emit('listenMessage', { success: Constant.TRUE, result: obj })
                                        }
                                    })
                                })
                            }
                            io.in(data.conversationId).emit('sendMessage', { success: Constant.TRUE, result: populatedData }); //emit to all in room including sender
                        })
                    }
                }).catch(error => {

                    if ((error.name == 'ValidationError'))
                        io.to(socketInfo[data.from]).emit('sendMessage', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                    else
                        io.to(socketInfo[data.from]).emit('sendMessage', error)
                })
            })
        })
    }
    // Message Schema

    createMessageSchema(data, conversation_id) {
        if (data.messageType == 'group')
            var conversation_id = data.groupId
        let message = new messageModel({
            message: data.message,
            to: data.to,
            from: data.from,
            type: data.type,
            messageType: data.messageType,
            groupId: data.groupId,
            conversationId: conversation_id,
            date: moment().valueOf(),
            readBy: data.from,
            isBlocked: data.isBlocked,
            media: data.media,
            duration: data.duration
        })
        return message;
    }

    // Add a username to connected socket for Single chat

    addUsername(socket, io, socketInfo) {
        socket.on('add', (user) => {
            console.log('add');
            socket.username = user.userId
            socketInfo[user.userId] = socket.id;
            io.emit(`${socket.username}_status`, { status: true, onlineTime: moment().valueOf() });
            io.emit('userOnline', { userId: socket.username, isOnline: Constant.TRUE, onlineTime: moment().valueOf() })
            this.addOnlineTime(socket.username).then({})
        })
    }


    userList(socket, io) {
        socket.on('userList', (user) => {
            userModel.find({}).then(result => {
                io.to(socket.id).emit('userList', { users: result })
            })

        })
    }
    //Get Chat History for one to one chat

    chatHistory(socket, io, room_members, socketInfo) {
        socket.on('chatHistory', (data) => {
            console.log('ChatHistory');

            if (!data.opponentId && !data.userId) {
                io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: Constant.PARAMSMISSINGCHATHISTORY });
            }
            else {
                conversationModel.findOne({
                    $or: [{ $and: [{ sender_id: data.opponentId }, { reciever_id: data.userId }] },
                    { $and: [{ sender_id: data.userId }, { reciever_id: data.opponentId }] }
                    ]
                }).then(conversation => {
                    let convId = ""
                    if (conversation) {
                        convId = conversation._id
                    } else {
                        const conversationSchema = new conversationModel({
                            sender_id: data.opponentId,
                            reciever_id: data.userId
                        })

                        convId = conversationSchema._id

                        conversationSchema.save({}).then()
                    }

                    messageModel.find({
                        $or: [{ $and: [{ isBlocked: true }, { from: data.userId }] },
                        { conversationId: convId, isBlocked: false, "is_deleted": false }],
                        // message: { $ne: "" }
                    }).populate('from to').then(result => {

                        messageModel.updateMany({
                            readBy: { $ne: data.userId },
                            $or: [{ $and: [{ isBlocked: true }, { from: data.userId }] }, { conversationId: convId, isBlocked: false }]
                        }, { $push: { readBy: data.userId } }, { multi: true }).then(
                            update => {
                                socket.join(convId, function () {
                                    room_members[convId] = io.sockets.adapter.rooms[convId].sockets
                                })
                            })
                        var isOnline;
                        // console.log(result[0]);


                        if (socketInfo.hasOwnProperty(data.opponentId))
                            isOnline = true
                        else
                            isOnline = false
                        io.to(socket.id).emit('isOnline', { isOnline: isOnline });
                        io.to(socket.id).emit('chatHistory', { success: Constant.TRUE, message: result, isOnline: isOnline, conversationId: convId });
                    }).catch(err => {

                        if (err.name == 'ValidationError' || 'CastError')
                            io.to(socket.id).emit('chatHistory', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                        else
                            io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: err });
                    })
                })
            }
        })
    }

    //Get Chat History for one to one chat

    groupChatHistory(socket, io, room_members) {
        socket.on('groupChatHistory', data => {
            if (!data.userId) {
                io.to(socket.id).emit('groupChatHistory', { success: Constant.FALSE, message: Constant.PARAMSMISSINGGROUPCHATHISTORY });
            }
            else {

                messageModel.updateMany({ group_id: data.groupId, readBy: { $ne: data.userId } }, { $push: { readBy: data.userId } }, { multi: true }).then(conversation => {

                    socket.join(data.groupId, function () {
                        room_members[data.groupId] = io.sockets.adapter.rooms[data.groupId].sockets

                    })

                    messageModel.find({ conversationId: data.groupId, message: { $ne: "" } }).populate('from').then(result => {
                        io.to(socket.id).emit('chatHistory', { success: Constant.TRUE, message: result, conversationId: data.groupId });
                    }).catch(err => {

                        if (err.name == 'ValidationError' || 'CastError')
                            io.to(socket.id).emit('chatHistory', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                        else
                            io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: err });
                    })
                })
            }
        })
    }

    // Get chatlist of a particular user

    chatList(socket, io, socketInfo) {
        socket.on('chatList', data => {

            var id = data.userId
            if (!id) {
                io.to(socket.id).emit('chatList', { success: Constant.FALSE, message: Constant.PARAMSMISSING })

            }
            var IDs = [];
            groupModel.find({ members: id }).then(groupMembers => {
                groupMembers.map(value => {

                    IDs.push(Mongoose.Types.ObjectId(value._id))
                })
                messageModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { to: Mongoose.Types.ObjectId(id) },
                                {
                                    from: Mongoose.Types.ObjectId(id)
                                },
                                {
                                    groupId: { $in: IDs }
                                }
                            ]
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "users",
                            localField: "to",
                            foreignField: "_id",
                            as: "to"
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "users",
                            localField: "from",
                            foreignField: "_id",
                            as: "from"
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "groups",
                            localField: "groupId",
                            foreignField: "_id",
                            as: "group"
                        }
                    },
                    {
                        $group: {
                            "_id": "$conversationId",
                            "messageId": { $last: "$_id" },
                            "type": { $first: "$type" },
                            "message": { $last: "$message" },
                            "messageType": { $last: "$messageType" },
                            "group": { $last: { $arrayElemAt: ["$group", 0] } },
                            "to": { $last: { $arrayElemAt: ["$to", 0] } },
                            "from": { $last: { $arrayElemAt: ["$from", 0] } },
                            "conversationId": { $first: "$conversationId" },
                            "date": { $last: "$date" },
                            unreadCount: { $sum: { $cond: { if: { $in: [Mongoose.Types.ObjectId(id), "$readBy"] }, then: 0, else: 1 } } } //{ $cond: { if: "$readBy", then: "$to", else: {} } },

                        }
                    }, {
                        $project: {
                            "_id": 0,
                            "messageId": 1,
                            "message": 1,
                            "group": {
                                $cond: { if: "$group", then: "$group", else: {} }
                            },
                            date: 1,
                            "sender": 1,
                            conversationId: 1,
                            "to": { $cond: { if: "$to", then: "$to", else: {} } },
                            "from": 1,
                            unreadCount: 1,
                            messageType: 1,
                            chatName: { $cond: { if: "$group", then: "$group", else: { $cond: { if: { $eq: ["$from._id", Mongoose.Types.ObjectId(id)] }, then: "$to", else: "$from" } } } }
                        }
                    },
                    { $sort: { "date": -1 } }
                ]).then(result => {


                    result.map(value => {
                        if (socketInfo.hasOwnProperty(value.chatName._id))
                            value.isOnline = true
                        else
                            value.isOnline = false
                        return value
                    })



                    io.to(socket.id).emit('chatList', { success: Constant.TRUE, chatList: result, message: Constant.TRUEMSG })
                }).catch(err => {
                    console.log(err);

                    if (err)
                        io.to(socket.id).emit('chatList', { success: Constant.FALSE, message: err })

                })
            })
        })
    }

    //emiting typing to a group or particular user

    typing(socket, io) {
        socket.on('typing', data => {
            userModel.findOne({ _id: data.from }).select('firstName lastName').then(user => {
                user.set('isTyping', data.isTyping, { strict: false })
                io.in(data.conversationId).emit('typing', { success: Constant.TRUE, from: user })
            })

        })
    }


    activeUsers(socket, io, socketInfo) {

        socket.on('activeUsers', data => {
            var activeUsers = []
            for (var key in socketInfo) {
                activeUsers.push(key)
            }


            io.to(socket.id).emit('activeUsers', { success: Constant.TRUE, activeUsers: activeUsers })
        })

    }


    userOnline(socket, io, socketInfo) {

    }

    //online User
    isOnline(socket, io, socketInfo) {
        socket.on('isOnline', data => {
            console.log(data, 'isOnline')
            if (!data.opponentId) {
                io.to(socket.id).emit('isOnline', { success: Constant.FALSE, message: Constant.OPPOMISSING });
            } else {
                var isOnline;
                if (socketInfo.hasOwnProperty(data.opponentId))
                    isOnline = true
                else
                    isOnline = false
                userModel.findById(data.opponentId).then(user => {
                    console.log(user)
                    io.to(socket.id).emit('isOnline', { isOnline: data.status, isOnline: isOnline, onlineTime: user.lastOnline });
                })
            }
        })
    }


    deleteMessage(socket, io) {
        socket.on('deleteMessage', data => {
            if (!data.messageId)
                io.to(socket.id).emit('deleteMessage', { success: Constant.FALSE, message: Constant.MESSAGEDELETE })
            else {
                messageModel.updateMany({
                    _id: data.messageId
                }, { $set: { is_deleted: true } }
                ).then(result => {
                    if (result)
                        io.to(socket.id).emit('deleteMessage', { success: Constant.TRUE, message: Constant.DELETEMSG })
                })
                    .catch(error => {
                        io.to(socket.id).emit('deleteMessage', { success: Constant.FALSE, message: error })
                    })
            }
        })
    }


    // Change Read Status of messages

    isRead(socket, io, socketInfo) {
        socket.on('isRead', data => {
            console.log('isRead');

            if (!data.userId && !data.conversationId)
                io.to(socket.id).emit('isRead', { success: Constant.FALSE, message: Constant.PARAMSMISSING })
            else {
                messageModel.update({ conversationId: data.conversationId, readBy: { $ne: data.userId }, isBlocked: false }, { $push: { readBy: data.userId } }, { multi: true }).then(updateResult => {
                    if (data.messageType == 'group')
                        io.in(data.groupId).emit('isRead', { success: Constant.TRUE })
                    else
                        io.to(socketInfo[data.opponentId]).emit('isRead', { success: Constant.TRUE })
                })
            }
        })
    }


    addOnlineTime(userId) {
        return new Promise((resolve, reject) => {
            if (userId) {
                userModel.findByIdAndUpdate(userId, { lastOnline: moment().valueOf() }, { new: true }).then(result => {
                    resolve(result)
                }).catch(err => console.log(err))
            }
        })
    }


}

module.exports = socketController;
