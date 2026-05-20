import exp from "express"
import jwt from "jsonwebtoken"
import {UserModel} from "../models/UserModel.js"
import {ArticleModel} from "../models/ArticleModel.js"
import {verifyToken} from "../middlewares/verifyToken.js"

export const adminApp = exp.Router()

adminApp.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body

        // admin credentials check
        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            })
        }

        // create token
        const token = jwt.sign(
            {
                email,
                role: "ADMIN"
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "7d"
            }
        )

        res.status(200).json({
            message: "Admin Login Success",
            token,
            role: "ADMIN"
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })

    }

})
// get all users
adminApp.get("/users",verifyToken("ADMIN"),async(req,res)=>{
    // get all usres
    const userList = await UserModel.find()
    // filter users where user is not Admin
    const users = userList.filter((user)=>user.role !== "ADMIN" && user.role !== "AUTHOR" )
    // send res
    res.status(200).json({payload:users})    
})

// get all authors
adminApp.get("/authors",verifyToken("ADMIN"),async(req,res)=>{
    // get all usres
    const userList = await UserModel.find()
    // filter users where user is not Admin
    const users = userList.filter((user)=>user.role !== "ADMIN" && user.role !== "USER" )
    // send res
    res.status(200).json({payload:users})    
})

// Activate or deactivate a user
adminApp.patch("/user",verifyToken("ADMIN"), async(req,res)=>{
    // get body of the req
    const {userId, isUserActive} = req.body
    // find user by user id
    const userDB = await UserModel.findById(userId)
    // if user is in same state as the given state
    if(isUserActive === userDB.isUserActive){
        return res.status(200).json({message:"User is already in the same state"})
    }
    // change it in the doc
    userDB.isUserActive = isUserActive
    // save doc
    userDB.save()
    // send res
    res.status(200).json({message:"User",payload:userDB})
})

// Activate or deactivate an author
adminApp.patch("/author",verifyToken("ADMIN"), async(req,res)=>{
    // get body of the req
    const {authorId, isAuthorActive} = req.body
    // find user by user id
    const authorDB = await UserModel.findById(authorId)
    // if user is in same state as the given state
    if(isAuthorActive === authorDB.isAuthorActive){
        return res.status(200).json({message:"Author is already in the same state"})
    }
    // change it in the doc
    authorDB.isAuthorActive = isAuthorActive
    // save doc
    authorDB.save()
    // send res
    res.status(200).json({message:"Author",payload:authorDB})
})

