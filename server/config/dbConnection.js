import mongoose from "mongoose";

mongoose.set('strictQuery', false) /* just ignore if any extra query is passed don't show error */
const connectionToDB = async()=>{
   try {
    const {connection} = await mongoose.connect(process.env.MONGODB_URI)
    if(connection){
     console.log(`Connected to MONGODB: ${connection.host}`);
    }
   } catch (e) {
      console.log(e);
      process.exit(1)
   }
}

export default connectionToDB