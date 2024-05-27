// Donna Quach, JavaScript 330B, Spring 2024
// grocerycategory.js file for Final Project - Grocery List 

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, unique: true, required: true },
    categoryDescription: { type: String }
});

module.exports = mongoose.model("categories", categorySchema);