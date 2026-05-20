import jwt from 'jsonwebtoken'
import {config} from 'dotenv'
const {verify}=jwt
config()

export const verifyToken=(...allowedRoles)=>{
    return (req,res,next)=>{ 
       try{
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if(!token){
        return res.status(401).json({message:"please login first"})
    }
    let decodedToken=verify(token,process.env.SECRET_KEY)
    if(!allowedRoles.includes(decodedToken.role)){
        return res.status(403).json({message:"you are not authorized"})
    }
    req.user=decodedToken;
    next()
}catch(err){
    res.status(401).json({message:"invalid token"})
}
    }
}
