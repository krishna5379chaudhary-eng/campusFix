const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    studentId: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["student", "admin"],
        required: true
    }

});

module.exports = mongoose.model("User", userSchema);