class AppError extends Error {
    constructor(message, statusCode){
        super(message)
         this.statusCode = statusCode
        //  jo bhi error aaya hai uska stack terace means kis line pe  kaun si file me javascript kya cheese fat rahi hai
        Error.captureStackTrace(this,  this.constructor) /* captureStackTrace me hum current constructor pass kr diya aur kiske reference me krna hai */
    }
}
export default AppError