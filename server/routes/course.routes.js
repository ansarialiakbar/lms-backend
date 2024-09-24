import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLectureByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { isLoggedIn, authorizedRoles, authorizeSubscriber } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// creating instance of router
const router = Router()

router.route('/')
     .get(getAllCourses)
     .post(
          isLoggedIn,
          authorizedRoles('ADMIN'),
         upload.single("thumbnail"),
         createCourse
          )
   
router.route('/:id')
   .get(isLoggedIn,  authorizeSubscriber, getLectureByCourseId)
   .put(isLoggedIn, 
      authorizedRoles('ADMIN'),
      updateCourse)
   .delete(isLoggedIn,
      authorizedRoles('ADMIN'),
          removeCourse)
          .post(isLoggedIn,
            authorizedRoles('ADMIN'),
            upload.single('lecture'),
            addLectureToCourseById)
export default router
