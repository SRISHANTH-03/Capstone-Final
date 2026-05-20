import {Schema,model,Types} from 'mongoose'

const commentSchema=new Schema({
    user:{
        type:Types.ObjectId,
        ref:"user",
        required:[true,"user id required"]
    },
    comment:{
        type:String,
        required:[true,'enter a comment']
    }

})
const articleSchema=new Schema({
    author:{
        type:Types.ObjectId,
        ref:"user",
        required:[true,"author id is required"]
    },
    title:{
        type:String,
        required:[true,"title is required"]
    },
    category:{
        type:String,
        required:[true,"category iss required"],
    },
    content:{
        type:String,
        required:[true,"content is required"]
    },
    comments:[{type:commentSchema,default:[]}],
    isArticleActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true,
    versionKey:false,
    strict:"throw"

})

export const ArticleModel=model("article",articleSchema)