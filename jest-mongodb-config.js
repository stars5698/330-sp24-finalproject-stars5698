// Donna Quach, JavaScript 330B, Spring 2024
// jest-mongodb-config.js file for Final Project - Grocery List 

module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: "6.0.5",
            skipMD5: true,
        },
        autoStart: true,
        instance: {
            dbName: "jest",
        },
    },
};