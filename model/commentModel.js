const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({

    comment: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    // 🆕 Add this field for nested replies
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reply',
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment