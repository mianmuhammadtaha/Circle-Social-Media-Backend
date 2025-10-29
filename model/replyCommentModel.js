const mongoose = require('mongoose')

const replySchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const Reply = mongoose.model("Reply" , replySchema)

module.exports = Reply