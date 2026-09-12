const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
complaintId: {
type: String,
required: true,
unique: true
},

studentId: {
    type: String,
    required: true
},

title: {
    type: String,
    required: true
},

category: {
    type: String,
    required: true
},

location: {
    type: String,
    required: true
},

description: {
    type: String,
    required: true
},

image: {
    type: String,
    default: null
},

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

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
