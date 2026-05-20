import {Schema,model} from 'mongoose'
const userSchema=new Schema({
    firstName:{
        type:String,
        required:[true,'First name is required']
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        required:[true,"Email required"],
        unique:[true,"email already exits"]

    },
    password:{
        type:String,
        required:[true,"password required"]
    },
    role:{
        type:String,
        enum:["USER","AUTHOR","ADMIN"],
        required:[true,"{Value} is an invalid role"]
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true,
    versionKey:false,
    strict:"throw"
})

//create model
export const UserModel=model("user",userSchema)