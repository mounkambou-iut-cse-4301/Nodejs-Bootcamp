const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DATABASE);
  console.log('DB connection successful!')
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

// Import data into db
const importData=async()=>{
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

// DElete all data from DB
const deleteData=async()=>{
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  }
//node dev-data/data/import-dev-data.js --delete
