const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");


router.get("/login", (req, res) => {

    res.render("data/login");

});


router.post("/login", wrapAsync(async (req, res) => {

    const { studentId, password } = req.body;

    if (!studentId || !password) {
        throw new ExpressError(400, "Student ID and password are required");
    }

    const user = await User.findOne({ studentId });

    if (!user) {
        throw new ExpressError(401, "Invalid ID or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new ExpressError(401, "Invalid ID or password");
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