const mongoose = require("mongoose")

const postschema = mongoose.Schema({
    description: {
        type: String,
        required: false
    },
    hashtag: {
        type: String,
        required: false
    },
    filepath: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "User",
        default : []
    },
    likecount: {
        type: Number,
        default : 0
    },
    comment: {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "Comment",
        default : []
    },
    commentCount: {
        type: Number,
        // required: true
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

const Post = mongoose.model('Post', postschema)

module.exports = Post