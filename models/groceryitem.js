// Donna Quach, JavaScript 330B, Spring 2024
// groceryitem.js file for Final Project - Grocery List 

const mongoose = require("mongoose");

const GroceryCategory = require('./grocerycategory');

const itemSchema = new mongoose.Schema({
    itemName: { type: String, unique: true, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: GroceryCategory, required: true, index: true },
    itemPrice: { type: Number, required: true }
});

// Create text index on the itemName field at the schema level
// Note: Syntax below is the way to create a text index in Mongoose (not MongoDB)
// Source: https://stackoverflow.com/questions/24714166/full-text-search-with-weight-in-mongoose
itemSchema.index({ itemName: 'text' });

module.exports = mongoose.model("items", itemSchema);