const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Complaint = require("../models/complaint");
const Emergency = require("../models/emergency");
const Announcement = require("../models/announcement");

const apiLimiter = require("../middleware/rateLimit");

router.get("/", apiLimiter, async (req, res) => {

    const complaints = await Complaint.find({});
    const emergencies = await Emergency.find({});

    const totalComplaints = complaints.length;

    const pendingComplaints = complaints.filter(
        complaint => complaint.status === "Pending"
    ).length;

    const inProgressComplaints = complaints.filter(
        complaint => complaint.status === "In Progress"
    ).length;

    const resolvedComplaints = complaints.filter(
        complaint => complaint.status === "Resolved"
    ).length;

    res.render("data/adminDashboard", {
        complaints,
        emergencies,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints
    });

});

router.get("/complaints/:id", apiLimiter, async (req, res) => {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        return res.status(404).send("Complaint not found");
    }

    const student = await User.findOne({
        studentId: complaint.studentId
    });

    if (!student) {
        return res.status(404).send("Student not found");
    }

    res.render("data/complaintDetails", {
        complaint,
        student
    });

});

router.get("/complaints/:id/edit", apiLimiter, async (req, res) => {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        return res.status(404).send("Complaint not found");
    }

    const student = await User.findOne({
        studentId: complaint.studentId
    });

    if (!student) {
        return res.status(404).send("Student not found");
    }

    res.render("data/editComplaint", {
        complaint,
        student
    });

});

router.patch("/complaints/:id", apiLimiter, async (req, res) => {

    const {
        department,
        status
    } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        {
            department: department,
            status: status
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!complaint) {
        return res.status(404).send("Complaint not found");
    }

    res.redirect("/admin/complaints/" + complaint._id + "/edit");

});

router.delete("/complaints/:id", apiLimiter, async (req, res) => {

    const complaint = await Complaint.findByIdAndDelete(
        req.params.id
    );

    if (!complaint) {
        return res.status(404).send("Complaint not found");
    }

    res.redirect("/admin");

});

router.post("/announcements", apiLimiter, async (req, res) => {

    const {
        title,
        message
    } = req.body;

    if (!title || !message) {
        return res.status(400).send(
            "Announcement title and message are required"
        );
    }

    const announcement = new Announcement({
        title: title,
        message: message
    });

    await announcement.save();

    res.redirect("/admin?announcement=published");

});

module.exports = router;
