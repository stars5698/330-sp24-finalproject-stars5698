// Donna Quach, JavaScript 330B, Spring 2024
// user.js file for Final Project - Grocery List 

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    roles: { type: [String], required: true }
});

module.exports = mongoose.model("users", userSchema); 