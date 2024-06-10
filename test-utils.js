// Donna Quach, JavaScript 330B, Spring 2024
// test-utils.js for Final Project - Grocery List 

const mongoose = require("mongoose");
const models = [
    require("./models/grocerycategory"),
    require("./models/groceryitem"),
    require("./models/grocerylist"),
    require("./models/user")
];

module.exports = {};

module.exports.connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL, {});
    await Promise.all(models.map((m) => m.syncIndexes()));
};

module.exports.stopDB = async () => {
    await mongoose.disconnect();
};

module.exports.clearDB = async () => {
    await Promise.all(models.map((model) => model.deleteMany()));
};

module.exports.findOne = async (model, query) => {
    const result = await model.findOne(query).lean();
    if (result) {
        result._id = result._id.toString();
    }
    return result;
};

module.exports.find = async (model, query) => {
    const results = await model.find(query).lean();
    results.forEach((result) => {
        result._id = result._id.toString();
    });
    return results;
};