const express = require("express");

const app = express();

const mongoose = require("mongoose");

const port = 8080;

const path = require("path");

const methodOverride = require("method-override");

const multer = require("multer");

const upload = multer({ dest: "public/uploads/" });

const wrapAsync = require("./utils/wrapAsync.js");

const ExpressError = require("./utils/ExpressError.js");

const Complaint = require("./models/complaint.js");

const complaintSchema = require("./utils/validateComplaint.js");

const complaintUpdateSchema = require("./utils/validateComplaintUpdate.js");

const fs = require("fs");


app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(methodOverride(function (req) {

    if (req.body && req.body._method) {
        return req.body._method;
    }

}));




main()
    .then(() => {
        console.log("connected db");
    })
    .catch((err) => console.log(err));

async function main() {


    await mongoose.connect("mongodb://127.0.0.1:27017/campusfix");


}

app.get("/", (req, res) => {


    res.render("data/index");


});

app.get("/student", wrapAsync(async (req, res) => {

const { studentId } = req.query;

if (!studentId) {
    throw new ExpressError(400, "Student ID is required");
}

const complaints = await Complaint.find({
    studentId: studentId
});

res.render("data/studentDashboard", {
    complaints,
    studentId
});

}));

app.get("/complaints/:id/photo", wrapAsync(async (req, res) => {

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



app.get("/admin", wrapAsync(async (req, res) => {


    const complaints = await Complaint.find({});

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

app.get("/complaints/new", (req, res) => {
const { studentId } = req.query;

res.render("data/newComplaint", {
    studentId
});

});


app.get("/complaints", wrapAsync(async (req, res) => {


    const complaints = await Complaint.find({});

    res.render("data/complaints", { complaints });


}));

app.post("/complaints", upload.single("image"), wrapAsync(async (req, res) => {

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


app.get("/complaints/:id", wrapAsync(async (req, res) => {


    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.render("data/complaintDetails", { complaint });


}));

app.get("/admin/complaints/:id", wrapAsync(async (req, res) => {


    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid complaint ID");
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.render("data/editComplaint", { complaint });


}));

app.patch("/admin/complaints/:id", wrapAsync(async (req, res) => {

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
            department: req.body.department,
            status: req.body.status
        },
        { new: true }
    );

    if (!complaint) {
        throw new ExpressError(404, "Complaint not found");
    }

    res.redirect("/admin");

}));

app.delete("/admin/complaints/:id", wrapAsync(async (req, res) => {

const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid complaint ID");
}

const complaint = await Complaint.findById(id);

if (!complaint) {
    throw new ExpressError(404, "Complaint not found");
}

if (complaint.image) {

    const imagePath = path.join(__dirname, "public", complaint.image);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

}

await Complaint.findByIdAndDelete(id);

res.redirect("/admin");

}));


app.all("/{*splat}", (req, res, next) => {


    next(new ExpressError(404, "Page not found!"));


});

app.use((err, req, res, next) => {


    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).send(message);


});

app.listen(port, () => {


    console.log("Server running on port " + port);


});
