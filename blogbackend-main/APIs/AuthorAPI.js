import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const authorApp = exp.Router();


// WRITE ARTICLE
authorApp.post(
  "/article",
  verifyToken("AUTHOR"),
  async (req, res) => {
    try {
      // Get article from frontend
      const articleObj = req.body;

      // Logged-in user from token
      const user = req.user;

      // Find author
      const author = await UserModel.findById(articleObj.author);

      // Check author exists
      if (!author) {
        return res.status(404).json({
          message: "Invalid author",
        });
      }

      // Verify ownership
      if (author.email !== user.email) {
        return res.status(403).json({
          message: "You are not authorized",
        });
      }

      // Create article
      const articleDoc = new ArticleModel(articleObj);

      // Save article
      await articleDoc.save();

      // Send response
      res.status(201).json({
        message: "Article published successfully",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);


// READ OWN ARTICLES
authorApp.get(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res) => {
    try {
      // Get author id from token
      const authorIdOfToken = req.user.id;

      // Fetch articles
      const articlesList = await ArticleModel.find({
        author: authorIdOfToken,
      });

      // Response
      res.status(200).json({
        message: "Articles fetched successfully",
        payload: articlesList,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);


// EDIT ARTICLE
authorApp.put(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res) => {
    try {
      // Author id from token
      const authorIdOfToken = req.user.id;

      // Data from frontend
      const { articleId, title, category, content } = req.body;

      // Update article
      const modifiedArticle = await ArticleModel.findOneAndUpdate(
        {
          _id: articleId,
          author: authorIdOfToken,
        },
        {
          $set: {
            title,
            category,
            content,
          },
        },
        {
          new: true,
        }
      );

      // Check authorization
      if (!modifiedArticle) {
        return res.status(403).json({
          message: "Not authorized to edit article",
        });
      }

      // Response
      res.status(200).json({
        message: "Article modified successfully",
        payload: modifiedArticle,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);


// SOFT DELETE ARTICLE
authorApp.patch(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res) => {
    try {
      // Author id from token
      const authorIdOfToken = req.user.id;

      // Data from frontend
      const { articleId, isArticleActive } = req.body;

      // Find article
      const articleOfDB = await ArticleModel.findOne({
        _id: articleId,
        author: authorIdOfToken,
      });

      // Check article exists
      if (!articleOfDB) {
        return res.status(404).json({
          message: "Article not found",
        });
      }

      // Check current status
      if (articleOfDB.isArticleActive === isArticleActive) {
        return res.status(200).json({
          message: "Article already in same state",
        });
      }

      // Update status
      articleOfDB.isArticleActive = isArticleActive;

      await articleOfDB.save();

      // Response
      res.status(200).json({
        message: "Article status updated",
        payload: articleOfDB,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);