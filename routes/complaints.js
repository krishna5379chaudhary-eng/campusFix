const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const multer = require("multer");

const Complaint = require("../models/complaint");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const complaintSchema = require("../schema");

const upload = multer({ dest: "public/uploads/" });


router.get("/:id/photo", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.render("data/viewimage", { complaint });

}));


router.get("/new", (req, res) => {

    const { studentId } = req.query;

    res.render("data/newComplaint", {
        studentId
    });

});


router.get("/", wrapAsync(async (req, res) => {

    const complaints = await Complaint.find({});

    res.render("data/complaints", {
        complaints
    });

}));


router.post("/", upload.single("image"), wrapAsync(async (req, res) => {

    const { error } = complaintSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    const complaint = new Complaint({

        complaintId: "CF-" + Date.now(),

        studentId: req.body.studentId,

        title: req.body.title,

        category: req.body.category,

        location: req.body.location,

        description: req.body.description,

        image: req.file ? "/uploads/" + req.file.filename : null

    });

    await complaint.save();

    res.redirect("/student?studentId=" + req.body.studentId);

}));


router.get("/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.render("data/complaintDetails", {
        complaint
    });

}));


module.exports = router;