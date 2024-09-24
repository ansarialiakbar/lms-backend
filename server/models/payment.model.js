import {model, Schema} from 'mongoose'

const paymentSchema = new Schema({
    // ager hum multiple payment ke liye use krte hai tu key->payment_id rakhna hai
    razorpay_payment_id:{
        type:String,
        required:true
    },
    razorpay_subscription_id:{
        type:String,
        required:true
    },
    razorpay_signature:{
        type:String,
        required:true
    }

},{
    timestamps: true
})
const payment = model('payment', paymentSchema)
export default payment