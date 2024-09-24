import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js"
import fs from 'fs/promises'
// import cloudinary from 'cloudinary'


import {v2 as cloudinary} from 'cloudinary'


const getAllCourses = async(req, res, next)=>{
    // get all courses
  try {
    const courses = await Course.find({}).select('-lectures')

    res.status(200).json({
        success:true,
        message:'All courses',
        courses,
    })

  } catch (e) {
    return res.status(500).json({
        success:false,
        message: e.message
    })
  }
}
const getLectureByCourseId = async(req, res)=>{
  try {
    const {id} = req.params
    console.log('course id>', id);
    const course = await Course.findById(id)
    console.log('course deatil', course);
    if(!course){
      return res.status(400).json({
        success:false,
        message:'Invalid course id'
       })
    }
    res.status(200).json({
      success:true,
      message:'Course lecture succesfully fetched',
      lectures:course.lectures,
    })
  } catch (e) {
   return res.status(500).json({
    success:false,
    message:e.message
   })
  }

}
const createCourse= async (req, res, next)=>{
     const {title, description, category, createdBy} = req.body
     if(!title || !description || !category || !createdBy){
      return next(new AppError('All fields are required', 400))
     }
     const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail:{
        public_id:'Dummy',
        secure_url:'Dummy',
      }
     })
     if(!course){
      return next(new AppError('Course could not created please try again', 500))
     }

     if(req.file){
     try {
      const result = await cloudinary.v2.uploader.uploads(req.file.path ,{
        folder: 'lms',
      })
      console.log(JSON.stringify(result));
      if(result){
        course.thumbnail.public_id = result.public_id
        course.thumbnail.secure_url = result.secure_url
      }
      // Removing uploaded file
      fs.rm(`uploads/${req.file.filename}`)
     } catch (e) {
      return next(new AppError(e.message, 500))
     }
     }

     await course.save()
     res.status(200).json({
      success:true,
      message:'course created successfully',
      course,
     })
}

const updateCourse = async(req, res, next)=>{
  try {
     // Extracting the course id from the request params
     const { id} = req.params
     // Finding the course using the course id
     const course = await Course.findByIdAndUpdate(
      id,{
        $set : req.body // This will only update the fields which are present
      },
      {
        runValidators: true, // This will run the validation checks on the new data
      }
     )
       // If no course found then send the response for the same
     if(!course){
      return next(new AppError('course with given id does not exist', 500))
     }
     res.status(200).json({
      succes:true,
      message:"Course updated successfully",
      course
     })
  } catch (e) {
    return next(new AppError(e.message, 500))
  }
}

const removeCourse = async(req, res, next)=>{
    try {
      const { id} = req.params
      const course = await Course.findById(id)

      if(!course){
        return next(new AppError('course with given id does not exist', 500))
       }
       await Course.findByIdAndDelete(id)
       res.status(200).json({
        succes:true,
        message:"Course deleted successfully",
       
       })

    } catch (e) {
      return next(new AppError('course with given id does not exist', 500))
    }
}
const addLectureToCourseById = async(req, res, next)=>{
   const {title, description} = req.body
   const {id} = req.params
   if(!title || !description ){
    return next(new AppError('All fields are required', 400))
   }

   const course = await Course.findById(id)
   
   if(!course){
    return next(new AppError('course with given id does not exist', 500))
   }

   const lectureData = {
    title,
    description,
    lecture: {}
   }

   if(req.file){
    try {
     const result = await cloudinary.v2.uploader.uploads(req.file.path ,{
       folder: 'lms',
     })
     console.log(JSON.stringify(result));
     if(result){
      lectureData.lecture.public_id = result.public_id
      lectureData.lecture.secure_url = result.secure_url
     }
     // Removing uploaded file
     fs.rm(`uploads/${req.file.filename}`)
    } catch (e) {
     return next(new AppError(e.message, 500))
    }
    }

    course.lectures.push(lectureData)
    course.numberOfLectures = course.lectures.length

    await course.save()

    res.status(200).json({
      success:true,
      message:'Lectures successfully added to your course',
      course,
    })
  }
export{
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById

}