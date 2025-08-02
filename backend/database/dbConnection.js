const mongoose = require('mongoose');

const dbConnection = () => {
    const MONGO_URI = process.env.MONGO_URI 
    
  
    
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    mongoose.connect(MONGO_URI, {
        dbName: "RESTAURANT2"
    }).then(() => {
        console.log("✅ Connected to database successfully!");

    }).catch(err => {
        console.log(`❌ Error connecting to database: ${err}`);
    });
};

module.exports = dbConnection;
