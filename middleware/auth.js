const ExpressError = require("../utils/ExpressError");
const User = require("../models/User");


async function requireLogin(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
        return res.redirect("/login");
    }

    req.user = user;

    next();

}


async function requireAdmin(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
        return res.redirect("/login");
    }

    if (user.role !== "admin") {
        throw new ExpressError(403, "Access denied");
    }

    req.user = user;

    next();

}


async function requireStudent(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
        return res.redirect("/login");
    }

    if (user.role !== "student") {
        throw new ExpressError(403, "Access denied");
    }

    req.user = user;

    next();

}


module.exports = {
    requireLogin,
    requireAdmin,
    requireStudent
};