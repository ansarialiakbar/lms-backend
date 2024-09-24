const errorMiddleware = (err, _req, res, _next)=>{
    // if message and statusCode not given
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Something Went Wrong!"
   return res.status(err.statusCode).json({
        success:false,
        message:err.message,
        stack:err.stack
    })
}
export default errorMiddleware