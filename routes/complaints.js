const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const multer = require("multer");

const Complaint = require("../models/complaint");
const Issue = require("../models/issue");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const complaintSchema = require("../schema");
const { requireStudent } = require("../middleware/auth");

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

router.post(
    "/",
    requireStudent,
    upload.single("image"),
    wrapAsync(async (req, res) => {

        console.log("REQ BODY:", req.body);

        const { error } = complaintSchema.validate(req.body);

        if (error) {
            throw new ExpressError(400, error.details[0].message);
        }

        const {
            studentId,
            title,
            category,
            location,
            description
        } = req.body;


        // Clean values before comparing
        const cleanTitle = title
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const cleanCategory = category
            .trim()
            .toLowerCase();

        const cleanLocation = location
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");


        // Find an existing issue with the same problem
        let issue = await Issue.findOne({
            title: cleanTitle,
            category: cleanCategory,
            status: { $ne: "Resolved" }
        });


        // Check if this student has already reported
        // the same issue from the same location
        if (issue) {

            const duplicate = await Complaint.findOne({
                issue: issue._id,
                studentId: studentId,
                location: cleanLocation
            });

            if (duplicate) {
                throw new ExpressError(
                    400,
                    "You have already reported this issue from this location."
                );
            }
        }


        // Create the complaint
        const complaint = new Complaint({

            complaintId: "CF-" + Date.now(),

            user: req.user._id,

            studentId: studentId,

            issue: issue ? issue._id : null,

            title: cleanTitle,

            category: cleanCategory,

            location: cleanLocation,

            description: description,

            image: req.file
                ? "/uploads/" + req.file.filename
                : null

        });


        await complaint.save();


        // If no existing issue was found,
        // create a new issue
        if (!issue) {

            issue = new Issue({

                title: cleanTitle,

                category: cleanCategory,

                complaints: [complaint._id]

            });

            await issue.save();


            // Connect complaint with the newly created issue
            complaint.issue = issue._id;

            await complaint.save();

        } else {

            // Add this complaint to the existing issue
            issue.complaints.push(complaint._id);

            await issue.save();

        }


        res.redirect("/student?studentId=" + studentId);

    })
);


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