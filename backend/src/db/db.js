const mongoose = require('mongoose');



function connectDB() {
    return mongoose.connect("mongodb://localhost:27017/food-view")
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1);  // Exit if DB connection fails
        });
}

module.exports = connectDB;