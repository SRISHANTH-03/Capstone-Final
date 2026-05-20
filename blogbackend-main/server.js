import exp from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import { userApp } from "./APIs/UserAPI.js";
import { authorApp } from "./APIs/AuthorAPI.js";
import { adminApp } from "./APIs/AdminAPI.js";
import { commonApp } from "./APIs/CommonAPI.js";

// Load environment variables
config();

const app = exp();

// ================= CORS =================
app.use(
  cors({
    origin: "https://capstonefinall.netlify.app",
    credentials: true,
  })
);

app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

// ================= DATABASE CONNECTION =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log("DB server connected");

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.log("Error in DB connect:", err);
  }
};

connectDB();

// ================= INVALID PATH HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    message: `Path ${req.url} is invalid`,
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.log("Global Error:", err);

  // Validation Error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      error: err.message,
    });
  }

  // Cast Error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Cast Error",
      error: err.message,
    });
  }

  // Duplicate Key Error
  const errCode =
    err.code ??
    err.cause?.code ??
    err.errorResponse?.code;

  const keyValue =
    err.keyValue ??
    err.cause?.keyValue ??
    err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];

    return res.status(409).json({
      message: `${field} "${keyValue[field]}" already exists`,
    });
  }

  // Default Server Error
  res.status(500).json({
    message: "Server side error",
  });
});