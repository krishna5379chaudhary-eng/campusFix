const express = require("express");
const router = express.Router();

const Announcement = require("../models/announcement");
const { requireStudent } = require("../middleware/auth");

router.get("/", requireStudent, async (req, res) => {

    const announcements = await Announcement.find({})
        .sort({ createdAt: -1 });

    res.render("data/announcements", {
        announcements
    });

});

module.exports = router;
