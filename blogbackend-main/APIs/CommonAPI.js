import exp from "express"
import {compare, hash} from 'bcryptjs'
import {UserModel} from '../models/UserModel.js'
import jwt from 'jsonwebtoken'
import {config} from 'dotenv'
import { verifyToken } from "../middlewares/verifyToken.js"
import { upload } from "../config/multer.js"
import { uploadToCloudinary } from "../config/cloudinaryUpload.js"
import cloudinary from '../config/cloudinary.js'
export const commonApp = exp.Router()
const {sign} = jwt
config()

// Register user
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;
  try {
    let allowedRoles = ["USER", "AUTHOR"];
    const newUser = req.body;

    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    newUser.profileImageUrl = cloudinaryResult?.secure_url;
    newUser.password = await hash(newUser.password, 12);

    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
    // Cleanup cloudinary if upload happened but save failed
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err);
  }
});

// Login - returns token in response body (not cookie) for cross-domain support
commonApp.post("/login", async(req, res, next) => {
  try {
    const {email, password} = req.body
    let user = await UserModel.findOne({email: email})
    if(!user){
        return res.status(400).json({message:"Invalid Email"})
    }
    if(user.isUserActive === false){
        return res.status(403).json({message:"Account is deactivated"})
    }
    let isMatched = await compare(password, user.password)
    if(!isMatched){
        return res.status(400).json({message:"Invalid password"})
    }

    const token = sign(
        {   
            id: user._id,
            email: email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl
        },
        process.env.SECRET_KEY,
        { expiresIn:"1d" }
    )

    let userObj = user.toObject();
    delete userObj.password

    // Return token in body - frontend stores in localStorage
    res.status(200).json({message:"login success", token, payload: userObj})
  } catch(err) {
    next(err)
  }
})

// Logout - frontend just clears localStorage
commonApp.get("/logout", (req, res) => {
    res.status(200).json({message:"Logout success"})
})

// Change password
commonApp.put("/password", verifyToken("USER","AUTHOR","ADMIN"), async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body
        if(currentPassword == newPassword){
            return res.status(400).json({message:"Current and new password are same"})
        }
        const userId = req.user?.id
        const user = await UserModel.findById(userId)
        let isMatched = await compare(currentPassword, user.password)
        if(!isMatched){
            return res.status(400).json({message:"Invalid current password"})
        }
        user.password = await hash(newPassword, 12)
        await user.save()
        res.status(200).json({message:"password successfully changed"})
    } catch(err) {
        next(err)
    }
})

// Check auth / page refresh
commonApp.get("/check-auth", verifyToken("USER","AUTHOR","ADMIN"), async (req, res) => {
    res.status(200).json({
        message:"authenticated",
        payload: req.user,
    })
})
