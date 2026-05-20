import exp from "express"
import {verifyToken} from "../middlewares/verifyToken.js"
import {ArticleModel} from "../models/ArticleModel.js"

export const userApp = exp.Router()

// Read articles of all authors
userApp.get("/articles",verifyToken("USER"),async(req,res)=>{
    // read all articles if they 
    const articleList = await ArticleModel.find({isArticleActive: true})
    // send res
    res.status(200).json({message:"articles",payload:articleList}) 
})
// add comment to an articles
userApp.put("/articles",verifyToken("USER"),async(req,res)=>{
    // get body from req
    const {articleId,comment} = req.body
    // check article
    const articleDocument = await ArticleModel.findOne({_id: articleId,isArticleActive: true}).populate("comments.user")
    // if not found
    if(!articleDocument){
        return res.status(404).json("Article not found")
    }
    // get user id
    const userId = req.user?.id
    const userEmail = req.user?.email
    // add comment to comment array articleDoc
    articleDocument.comments.push({user:userId,comment:comment})
    // save
    await articleDocument.save()
    // send res
    res.status(200).json({message:"Article",payload:articleDocument})
})