const Joi = require("joi");

const complaintUpdateSchema = Joi.object({
department: Joi.string().required(),

status: Joi.string()
    .valid("Pending", "Assigned", "In Progress", "Resolved")
    .required()

});

module.exports = complaintUpdateSchema;
