const mongoose = require('mongoose')

const followSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
},{ timestamps: true }
)

const Follow = mongoose.model("Follow" , followSchema)

module.exports = Follow