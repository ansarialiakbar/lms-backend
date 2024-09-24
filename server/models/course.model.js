import {model, Schema} from "mongoose"

const courseSchema = new Schema ({
    title:{
        type:'String',
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be atleast 5 character'],
        maxLength:[59, 'Title should be less than 60 character'],
        trim:true
    },
    description:{
        type:'String',
        required: [true, 'Description is required'],
        minLength: [10, 'Title must be atleast 10 character'],
        maxLength:[200, 'Title should be less than 201 character'],
    },
    category:{
        type:'String',
        required:true,
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    },
    lectures:[
        {
        tiltle:String,
        description:String,
        lecture:{
            public_id:{
                type:String,
                required:true,
            },
            secure_url:{
                type:String,
                required:true,
            }
        }
    }
    ],
    numberOfLectures:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:String,
    }
}, {
    timestamps: true
})

// creating a model
const Course = model('Course', courseSchema)
export default Course