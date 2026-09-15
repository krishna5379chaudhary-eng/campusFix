const express = require("express");
const router = express.Router();
const Emergency = require("../models/emergency");
const User = require("../models/user");
const { requireStudent } = require("../middleware/auth");
const nodemailer = require("nodemailer");

router.post("/", requireStudent, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const emergency = new Emergency({
            student: user._id,
            building: user.building,
            floor: user.floor
        });

        await emergency.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "CampusFix Emergency Alert",
            text:
                `Emergency reported by ${user.name}\n` +
                `Student ID: ${user.studentId}\n` +
                `Email: ${user.email}\n` +
                `Building: ${user.building}\n` +
                `Floor: ${user.floor}`
        });

        return res.status(201).json({
            success: true,
            message: "Emergency reported successfully"
        });

    } catch (error) {
        console.log("EMERGENCY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;