const mongoose = require("mongoose");
const validator=require('validator')
const bcript = require('bcryptjs');
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,'Please tell us your name']
        },
        email:{
            type:String,
            required:[true,'Please tell us your email'],
            unique:true,
            lowercase:true,
            validate:[validator.isEmail,'Please provide a valid email']
        },
        photo:String,
        password:{
            type:String,
            required:[true,'Please tell us your password'],
            minlength:8
        },
        passwordConfirm:{
            type:String,
            required:[true,'Please tell us your password'],
            validate:{

                //This only work on SAVE// Create
                validator:function(el){
                    return el===this.password; 
                },
                message:'Password does not match'

            }
        }
    }
)

//Add document middleware: runs before .save() and .create()
userSchema.pre("save", async function (next) {

    // Only run this function if password was modified
    if(!this.isModified('password')) return next()
//encription
this.password= await bcript.hash(this.password,12)

//delete the passwordConfirm field
this.passwordConfirm=undefined;
next();
  });

const User = mongoose.model("User", userSchema);

module.exports = User;