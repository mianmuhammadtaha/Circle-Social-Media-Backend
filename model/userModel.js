const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    profileImg: {
        type: String,
        required: false,
        default: "https://via.placeholder.com/150"
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    dob: {
        type: Date,
        required: true,
        default: Date.now
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        // select : false
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

const User = mongoose.model('User', userSchema)

module.exports = User