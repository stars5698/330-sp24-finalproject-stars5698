// Donna Quach, JavaScript 330B, Spring 2024
// index.js file for Final Project - Grocery List 

const server = require("./server");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

mongoose
    .connect("mongodb://127.0.0.1/Grocery-Shopping", {})
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}`);
        });
    })
    .catch((e) => {
        console.error(`Failed to start server:`, e);
    }); 