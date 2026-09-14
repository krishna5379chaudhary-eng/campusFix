const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Complaint = require("../models/complaint");
const User = require("../models/user");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Joi = require("joi");

const complaintUpdateSchema = Joi.object({

    department: Joi.string().required(),

    status: Joi.string()
        .valid("Pending", "Assigned", "In Progress", "Resolved")
        .required()

});


router.get("/", wrapAsync(async (req, res) => {

    const complaints = await Complaint.find({})
        .populate("user");

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
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints
    });

}));


router.get("/complaints/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id)
        .populate("user");

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    let user = complaint.user;

    if (!user && complaint.studentId) {

        user = await User.findOne({
            studentId: complaint.studentId
        });

    }

    res.render("data/editComplaint", {
        complaint,
        user
    });

}));


router.patch("/complaints/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const { department, status } = req.body;

    const { error } = complaintUpdateSchema.validate({
        department,
        status
    });

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    const complaint = await Complaint.findByIdAndUpdate(
        id,
        {
            department,
            status
        },
        { new: true }
    );

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.redirect("/admin");

}));


router.delete("/complaints/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    if (complaint.image) {

        const imagePath = path.join(
            __dirname,
            "..",
            "public",
            complaint.image.replace(/^\/+/, "")
        );

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

    }

    await Complaint.findByIdAndDelete(id);

    res.redirect("/admin");

}));


module.exports = router;