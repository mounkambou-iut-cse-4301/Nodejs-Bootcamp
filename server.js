const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DATABASE);
  console.log('DB connection successful!')
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true
    },
    rating:{
        type:Number,
        default:4.5
    },
    price:{
        type:String,
        required:[true,'A tour must have a price'],
    }
});

const Tour=mongoose.model('Tour',tourSchema);

const testTour=new Tour({
  name:'The Parc Camper',
  // rating:4.7,
  price:497
});
testTour.save().then(doc=>{
  console.log(doc);
}).catch(error=>{
  console.log('err: 🔥',error);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});