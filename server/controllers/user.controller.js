
import User from '../models/user.model.js'
import AppError from "../utils/error.util.js"
import cloudinary from "cloudinary"
import fs from "fs/promises"
import sendEmail from "../utils/sendEmail.js"
import crypto from "crypto"
const cookieOptions = {
  maxAge:7 * 24 * 60 * 60 * 1000, /* 7 days */
  httpOnly:true,
  secure:true
}
const register = async(req, res, next)=>{
  const {fullName, email, password} = req.body
  if(!fullName || !email || !password){
    return next(new AppError('All fields are required', 400))
  }
  // checking user exist in db or not
  const userExists = await User.findOne({email})
if(userExists){
  return next(new AppError('Email already exist', 409))
}
// if not then create user we can directly save it or other method
// first we will store basic information of a user like fullname, email, password
// finally upload on third party and then save it
 const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id:email,
      secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
    }
 })
 if(!user){
  return next(new AppError('User registration failed, Please try again', 400))
 }

//  TODO:file upload
// we will get converted file
// we will upload data on cloudinary
// cloudinary are helpful in file upload and  to move  from one place to another
if(req.file){
  console.log('File Detail >', JSON.stringify(req.file));
  try {
    const result =await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        width:250,
        height:250,
        gravity:'faces',
        crop:'fill'
    })
    if(user){
      user.avatar.public_id = result.public_id
      user.avatar.secure_url = result.secure_url
      // Remove file from server (delete file from local )
      // humhe cloudinary me rakhni hai file
     fs.rm(`uploads/${req.file.filename}`)
    }
  } catch (err) {
   return next(new AppError(err || 'File not uploaded, please try again', 400))
  }
}

// saving user
await user.save()
// before sending user we don't want to send password to the user
user.password = undefined

// Generating token and send to the cookie
const token = await user.generateJWTToken()
// storing token in cookie
res.cookie('token', token, cookieOptions)

res.status(201).json({
  success:true,
  message:'User registered successfully ',
  user,
})

}
const login = async(req, res, next)=>{
  try {
    const {email, password} = req.body
    if(!email || password){
      return next(new AppError('All fields are required', 400))
    }
    const user = await User.findOne({
      email
    }).select('+password') /* here we are giving explicitely password  */
    // user  not  exist  
    if(!user || !user.comparePassword(password)){
      return next(new AppError('Email or password does not matched', 400))
    }
    // user exist
    const token = await  user.generateJWTToken()
    user.password = undefined
  
    res.cookie('token', token, cookieOptions)
  
    res.status(200).json({
      success:true,
      message:'User successfully login',
      user,
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
 
}
const logout = (resq, res)=>{
    response.cookie('token', null, {
      maxAge:0,
      httpOnly:true,
      secure:true
    })

    res.status(200).json({
       success:true,
       message:"User successfully logout"
    })

}
const getProfile = async(req, res)=>{
  try {
    const userId = req.user.userId
    // from middleware we will get thid id
    const user = await User.findById(userId)

    res.status(200).json({
      success:true,
      message:'User detail',
      user
    })

  } catch (e) {
    return next(new AppError('failed to fetch profile', 500))
  }
}
/*
1 email > validate in database > Generate new token > send email with new url containing token > save token with expiry in database.
2 get token from url query param > verify token in database > update passsword in database
*/

const forgotPassword = async(req, res, next)=>{
   const {email} = req.body
   if(!email){
    return next(new AppError('Email is required', 400))
   }
   const user = await User.findOne({email})
   if(!user){
    return next(new AppError('Email not registerd', 400))
   }
   const resetToken = await user.generatePasswordResetToken()
   //  storing token in database
   await user.save()
  //  sending url in the mail
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  console.log(resetPasswordUrl);
  const subject = 'Reset Password'
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

  // we have to send a email to this url
  try {
    await sendEmail(email, subject, message)

    res.status(200).json({
      success:true,
      message:`Reset password token has sent to ${email} successfully`
    })
  } catch (e) {
    // if email not sent or some error occured
   user.forgotPasswordExpiry = undefined 
   user.forgotPasswordToken = undefined
     await user.save()
   return next(new AppError(e.message, 500))
  }
  

}

const resetPassword = async(req, res, next)=>{
   const {resetToken} = req.params
   const {password}  = req.body
   const forgotPasswordToken = crypto
               .createHash('sha256')
               .update(resetToken)
               .digest('hex')
  //  first we will go in db to check this resetToken is exist or not
   const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry:{$gt: Date.now() }
   })
   if(!user){
    return next(
      new AppError('Token is invalid or Expire, Please try again', 400)
    )
   }
  //  if user exist reset new password
     user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    user.save()
    res.status(200).json({
      success:true,
      message:'Password changed successfully'
    })
}
const changePassword = async(req, res, next)=>{
   const {oldPassword, newPassword} = req.body
   const {id}  = req.user // because of the middleware isLoggedIn
   if(!oldPassword || !newPassword){
    new AppError('All fields are required', 400)
   }
    // Finding the user by ID and selecting the password
    const user = await User.findById(id).select('+password')
     // If no user then throw an error message
  if (!user) {
    return next(new AppError('Invalid user id or user does not exist', 400));
  }
  const isPasswordValid = await User.comparePassword(oldPassword)
  if (!oldPassword) {
    return next(new AppError('', 400));
  }
    // Setting the new password
    user.password = newPassword;

    // Save the data in DB
    await user.save();
    user.password = undefined
    res.status(200).json({
      success:true,
      message:'Password changed successfully'
    })

}
const updateUser = async(req, res)=>{
   const {fullName} = req.body
   const {id} = req.user.id

   const user = await User.findById(id)
   if(!user){
    return next(new AppError('User  does not exist', 400))
   }
   if(req.fullName){
    user.fullName = fullName
   }
    // Run only if user sends a file
    if(req.file){
      await cloudinary.v2.uploader.destroy(user.avatar.public_id)
      try {
        const result =await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        })
        if(user){
          user.avatar.public_id = result.public_id
          user.avatar.secure_url = result.secure_url
          // Remove file from server (delete file from local )
          // humhe cloudinary me rakhni hai file
         fs.rm(`uploads/${req.file.filename}`)
        }
      } catch (err) {
       return next(new AppError(err || 'File not uploaded, please try again', 400))
      }
    }
    await user.save()
    res.status(200).json({
      success: true,
      message:'Profile updated succesfully'
    })
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
  
}