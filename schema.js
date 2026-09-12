const Joi = require("joi");

const complaintSchema = Joi.object({


title: Joi.string().required(),

category: Joi.string().required(),

location: Joi.string().required(),

description: Joi.string().required()


});

module.exports = complaintSchema;
