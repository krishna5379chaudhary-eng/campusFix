const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    building: {
        type: String,
        required: true
    },

    floor: {
        type: String,
        required: true
    },

    message: {
        type: String,
        default: "Emergency reported"
    },

    status: {
        type: String,
        enum: ["Active", "Resolved"],
        default: "Active"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Emergency", emergencySchema);
