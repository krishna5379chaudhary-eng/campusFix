const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    complaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    }],

    department: {
        type: String,
        default: "Not Assigned"
    },

    status: {
        type: String,
        enum: ["Pending", "Assigned", "In Progress", "Resolved"],
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;