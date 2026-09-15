require("dotenv").config();
const express = require("express");

const app = express();

const mongoose = require("mongoose");

const port = 8080;

const path = require("path");

const methodOverride = require("method-override");

const wrapAsync = require("./utils/wrapAsync.js");

const ExpressError = require("./utils/ExpressError.js");

const Complaint = require("./models/complaint.js");

const session = require("express-session");

const MongoStore = require("connect-mongo").MongoStore;

const { requireAdmin } = require("./middleware/auth");
const emergencyRouter = require("./routes/emergency");
const adminSetupRouter = require("./routes/adminSetup");
const forgotPasswordRouter = require("./routes/forgotPassword");


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


app.use(session({

    secret: "campusfix-secret",

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: "mongodb://127.0.0.1:27017/campusfix"
    }),

    cookie: {
        maxAge: 1000 * 60 * 60
    }

}));

app.use("/emergency", emergencyRouter);
app.use("/admin-setup", adminSetupRouter);
app.use("/forgot-password", forgotPasswordRouter);


main()
    .then(() => {
        console.log("connected db");
    })
    .catch((err) => console.log(err));


async function main() {

    await mongoose.connect(
        "mongodb://127.0.0.1:27017/campusfix"
    );

}


// Home page

app.get("/", (req, res) => {

    res.redirect("/login");

});


// Authentication routes

const authRouter = require("./routes/auth");

app.use("/", authRouter);


// Complaint routes

const complaintsRouter = require("./routes/complaints");

app.use("/complaints", complaintsRouter);


// Admin routes

const adminRouter = require("./routes/admin");

app.use("/admin", requireAdmin, adminRouter);


// Student dashboard

app.get("/student", wrapAsync(async (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "student") {
        throw new ExpressError(403, "Access denied");
    }

    const studentId = req.session.studentId;

    const complaints = await Complaint.find({
        studentId: studentId
    });

    res.render("data/studentDashboard", {
        complaints,
        studentId
    });

}));


// 404

app.all("/{*splat}", (req, res, next) => {

    next(new ExpressError(404, "Page not found!"));

});


// Error handling

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