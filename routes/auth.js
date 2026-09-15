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
        building,
        floor,
        password
    } = req.body;

    if (!name || !studentId || !email || !building || !floor || !password) {
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
        building: building,
        floor: floor,
        password: hashedPassword,
        role: "student"
    });

    await user.save();

    res.render("data/register", {
        success: "Student added successfully"
    });

}));

router.get("/login", (req, res) => {

    const error = req.session.loginError;

    req.session.loginError = null;

    res.render("data/login", {
        error: error
    });

});

router.post("/login", wrapAsync(async (req, res) => {

    const {
        studentId,
        password
    } = req.body;

    if (!studentId || !password) {

        req.session.loginError = "Student ID and password are required";

        return res.redirect("/login");

    }

    const user = await User.findOne({
        studentId: studentId
    });

    if (!user) {

        req.session.loginError = "Invalid ID or password";

        return res.redirect("/login");

    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {

        req.session.loginError = "Invalid ID or password";

        return res.redirect("/login");

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