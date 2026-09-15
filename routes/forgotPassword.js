const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/user");

router.get("/", (req, res) => {

    res.render("data/forgotPassword");

});

router.post("/", async (req, res) => {

    try {

        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).send("Student ID / Admin ID is required");
        }

        const user = await User.findOne({
            studentId: studentId
        });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        req.session.resetUserId = user._id;
        req.session.resetOtp = otp;
        req.session.resetOtpExpires = Date.now() + 5 * 60 * 1000;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "CampusFix Password Reset OTP",
            text: `Your CampusFix password reset OTP is ${otp}. This OTP is valid for 5 minutes.`
        });

        res.redirect("/forgot-password/verify");

    } catch (error) {

        console.log("FORGOT PASSWORD ERROR:", error);

        res.status(500).send(
            "Failed to send OTP: " + error.message
        );

    }

});

router.get("/verify", (req, res) => {

    if (!req.session.resetUserId) {
        return res.redirect("/forgot-password");
    }

    res.render("data/verifyOtp");

});

router.post("/verify", async (req, res) => {

    try {

        const { otp } = req.body;

        if (!otp) {
            return res.status(400).send("OTP is required");
        }

        if (!req.session.resetUserId) {
            return res.redirect("/forgot-password");
        }

        if (Date.now() > req.session.resetOtpExpires) {
            req.session.resetOtp = null;
            req.session.resetOtpExpires = null;

            return res.status(400).send(
                "OTP has expired. Please request a new OTP."
            );
        }

        if (otp !== req.session.resetOtp) {
            return res.status(400).send(
                "Invalid OTP"
            );
        }

        req.session.otpVerified = true;

        req.session.resetOtp = null;
        req.session.resetOtpExpires = null;

        res.redirect("/forgot-password/reset");

    } catch (error) {

        console.log("OTP VERIFICATION ERROR:", error);

        res.status(500).send(
            "OTP verification failed: " + error.message
        );

    }

});

router.get("/reset", (req, res) => {

    if (!req.session.resetUserId || !req.session.otpVerified) {
        return res.redirect("/forgot-password");
    }

    res.render("data/resetPassword");

});

router.post("/reset", async (req, res) => {

    try {

        const {
            password,
            confirmPassword
        } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).send(
                "Both password fields are required"
            );
        }

        if (password !== confirmPassword) {
            return res.status(400).send(
                "Passwords do not match"
            );
        }

        if (!req.session.resetUserId || !req.session.otpVerified) {
            return res.redirect("/forgot-password");
        }

        const user = await User.findById(
            req.session.resetUserId
        );

        if (!user) {
            return res.status(404).send(
                "User not found"
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        user.password = hashedPassword;

        await user.save();

        req.session.resetUserId = null;
        req.session.otpVerified = null;
        req.session.resetOtp = null;
        req.session.resetOtpExpires = null;

        res.redirect("/login");

    } catch (error) {

        console.log("RESET PASSWORD ERROR:", error);

        res.status(500).send(
            "Password reset failed: " + error.message
        );

    }

});

module.exports = router;