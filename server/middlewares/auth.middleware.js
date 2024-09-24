import AppError from "../utils/error.util.js"
import jwt from 'jsonwebtoken'

const isLoggedIn = async(req, res, next)=>{
    const {token} = req.cookie
    // token does not exist
    if(!token){
        return next(new AppError('Unauthenticated, Please login again', 401))
    }
    // token exist
    // we get data by passing token, secret key in the verify

    const userDetail = await jwt.verify(token, process.env.jwt_SECRET)
        req.user =  userDetail
        next()
}

const authorizedRoles = (...roles)=>(req, res)=>{
  const currentUserRole = req.user.role
  // if currentUserRole does not exist in roles then return
  if(!roles.includes(currentUserRole)){
   return next(new AppError('you do not have permission to access this route', 403))
  }
  next()
}
const authorizeSubscriber = async(req, res, next)=>{
   const subscription = req.user.subscription
   const currentUserRole = req.user.role
   if(currentUserRole !== 'ADMIN' && subscription.status !== 'Active'){
    return next(new AppError('you do not have permission to access this route', 403))
   }
   next()
}
export{
  isLoggedIn,
  authorizedRoles,
  authorizeSubscriber
}