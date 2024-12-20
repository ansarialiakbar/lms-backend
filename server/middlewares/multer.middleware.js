// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
import path from "path"
import multer from "multer"

const upload = multer({
    dest:"uploads/",
    limits:{fileSize: 50 * 1024 * 1024}, /* 50mb max size */
    storage:multer.diskStorage({
        destination:"uploads/",
        filename: (_req, file, cb)=>{
           cb(null, file.originalname)
        },
    }),
    fileFilter:(_req, file, cb)=>{
        let ext = path.extname(file.originalname)

        if(ext !==".jpg" &&
           ext !==".jpeg" &&
           ext !==".webp" &&
           ext !==".png" &&
           ext !==".mp4" 
        ){
            // calback
            cb(new Error(`Unsupported file type! ${ext}`), false)
            return
        }
        cb(null, true)
            
    }
})
export default upload