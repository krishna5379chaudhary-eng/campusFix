const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    studentId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    mobile: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["student", "admin"],
        required: true
    },

    building: {
        type: String,
        default: ""
    },

    floor: {
        type: String,
        default: ""
    }

});

module.exports = mongoose.model("User", userSchema);