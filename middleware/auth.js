const ExpressError = require("../utils/ExpressError");


function requireLogin(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    next();

}


function requireAdmin(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "admin") {
        throw new ExpressError(403, "Access denied");
    }

    next();

}


function requireStudent(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "student") {
        throw new ExpressError(403, "Access denied");
    }

    next();

}


module.exports = {
    requireLogin,
    requireAdmin,
    requireStudent
};