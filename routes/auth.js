const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { requireAdmin } = require("../middleware/auth");

router.get("/register", requireAdmin, (req, res) => {

    res.render("data/register", {
        success: null
    });

});

router.post("/register", requireAdmin, wrapAsync(async (req, res) => {

    const {
        name,
        studentId,
        email,
        password
    } = req.body;

    if (!name || !studentId || !email || !password) {
        throw new ExpressError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [
            { studentId: studentId },
            { email: email }
        ]
    });

    if (existingUser) {
        throw new ExpressError(
            400,
            "Student ID or email is already registered"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name: name,
        studentId: studentId,
        email: email,
        password: hashedPassword,
        role: "student"
    });

    await user.save();

    res.render("data/register", {
        success: "Student added successfully"
    });

}));

router.get("/login", (req, res) => {

    res.render("data/login");

});

router.post("/login", wrapAsync(async (req, res) => {

    const {
        studentId,
        password
    } = req.body;

    if (!studentId || !password) {
        throw new ExpressError(
            400,
            "Student ID and password are required"
        );
    }

    const user = await User.findOne({
        studentId: studentId
    });

    if (!user) {
        throw new ExpressError(
            401,
            "Invalid ID or password"
        );
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new ExpressError(
            401,
            "Invalid ID or password"
        );
    }

    req.session.userId = user._id;
    req.session.studentId = user.studentId;
    req.session.role = user.role;

    if (user.role === "admin") {
        return res.redirect("/admin");
    }

    res.redirect("/student");

}));

router.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login");
    });

});

module.exports = router;