// two things we needed schema and model
import { Schema, model } from "mongoose";
import crypto from 'crypto';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// make any schema e.g userSchema
// make an instance of userSchema
const userSchema = new Schema ({
  fullName:{
       type:'String',
       required: [true, 'Name is required'],
       minLength: [5, 'Name must be atleast 5 character '],
       maxLength: [30, 'Name should be less than 30 character'],
       trim:true
  },
  email:{
     type: 'String',
     required: [true, 'Email is required'],
     lowercase:true,
     trim:true,
     match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, 'please fill a vallid email']
  },
  password:{
   type:'String',
   required:[true, 'Password is required'],
   minLength:[6, 'Password must be atleast 8 character'],
   select:false /* do not give password to the end user  */
  },
  avatar:{
    public_id:{
      type:'String'
    },
    secure_url:{
      type:'String'
    }
  },
  role:{
   type:'String',
   enum:['USER', 'ADMIN'],
   default:'USER'
  },
  forgotPasswordToken:String,
  forgotPasswordExpiry:Date,
  subscription:{
    id:String,
    status:String,
  }
},{
  timestamps:true /* By default related to create and update are stamp */
}
)

// Encrypting Password
// pre is hook 
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    return next()
  }
  // hash is a async 
  this.password = await bcrypt.hash(this.password, 10)
}) 
// generic method
userSchema.methods = {
  generateJWTToken:async function(){
       return await jwt.sign(
        { id:this._id, email:this.email, subscription:this.subscription, role:this.role},
        process.env.JWT_SECRET,
        {
         expiresIn: process.env.JWT_EXPIRY
        }

       )
  },
  comparePassword:async function(plainTextPassword){
    // bcrypt is a async job 
   return await bcrypt.comparePassword(plainTextPassword, this.password)
  },
  generatePasswordResetToken: async function (){
    const resetToken = await crypto.randomBytes(20).toString('hex')
  // Related to security don't keep as it is in  database , keep in better way
    this.forgotPasswordToken = crypto
             .createHash('sha256')  /*creating token with the algorithm */
              .update(resetToken)
              .digest('hex');  /* converting token in hex form  */
    this.forgotPasswordExpiry = Date.now() + 15 * 60* 1000 /* 15mins from now  */
    return resetToken
  }
}
const User = model('User', userSchema) /* User is a collection in the db  */
export default User