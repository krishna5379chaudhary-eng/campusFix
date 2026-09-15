const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({


    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }

});

const Announcement = mongoose.model(
"Announcement",
announcementSchema
);

module.exports = Announcement;
