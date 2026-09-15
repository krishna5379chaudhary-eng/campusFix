const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const User = require("../models/user");

router.get("/:token", async (req, res) => {

    if (req.params.token !== process.env.ADMIN_SETUP_TOKEN) {
        return res.status(403).send("Invalid admin setup token.");
    }

    const existingAdmin = await User.findOne({
        role: "admin"
    });

    if (existingAdmin) {
        return res.status(403).send(
            "Admin setup has already been completed."
        );
    }

    res.render("data/adminSetup", {
        token: req.params.token
    });

});

router.post("/:token", async (req, res) => {

    try {

        if (req.params.token !== process.env.ADMIN_SETUP_TOKEN) {
            return res.status(403).send("Invalid admin setup token.");
        }

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            return res.status(403).send(
                "Admin setup has already been completed."
            );
        }

        const {
            name,
            adminId,
            email,
            mobile,
            password
        } = req.body;

        if (!name || !adminId || !email || !mobile || !password) {
            return res.status(400).send(
                "All fields are required."
            );
        }

        const existingUser = await User.findOne({
            $or: [
                { studentId: adminId },
                { email: email }
            ]
        });

        if (existingUser) {
            return res.status(400).send(
                "Admin ID or email is already registered."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            name: name,
            studentId: adminId,
            email: email,
            mobile: mobile,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();

        res.send(
            "Admin account created successfully. You can now login."
        );

    } catch (error) {

        console.log("ADMIN SETUP ERROR:", error);

        res.status(500).send(
            "Admin setup failed."
        );

    }

});

module.exports = router;
