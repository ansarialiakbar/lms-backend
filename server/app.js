import {config} from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.route.js'
import errorMiddleware from './middlewares/error.middleware.js'

config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true })) /* this urlencoded is helpful in to extract query params and parsing  */
app.use(cors({
    origin:[process.env.CLIENT_URL],
    credentials:true
}))
app.use(cookieParser())
app.use(morgan('dev'))
// to check the server is up or down
app.use('/ping', function(req, res){
  res.send('Pong')
})
// module 3 routes
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/payment', paymentRoutes)

app.all('*', (req, res)=>{
    res.status(404).send('OOPS! 404 page not found')
})
// Generic error handling
app.use(errorMiddleware)
 export default app