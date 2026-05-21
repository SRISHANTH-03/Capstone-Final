import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const { verify } = jwt;

export const verifyToken = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get Authorization header
      const authHeader = req.headers.authorization;

      // Check if token exists
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Please login first",
        });
      }

      // Extract token
      const token = authHeader.split(" ")[1];

      // Verify token
      const decodedToken = verify(token, process.env.SECRET_KEY);

      // Check role authorization
      if (!allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({
          message: "You are not authorized",
        });
      }

      // Attach user to request
      req.user = decodedToken;

      next();
    } catch (err) {
      console.log(err);

      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};