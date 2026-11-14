
import express from "express";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Check if customer is logged in
router.use(authMiddleware);

// Only customers can modify their own wishlist
router.use((req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Only customers can access this wishlist.",
    });
  }

  next();
});

// 1. GET CUSTOMER WISHLIST
router.get("/", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user.userId,
    }).populate("products");

    res.status(200).json({
      products: wishlist?.products || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch wishlist.",
    });
  }
});

// 2. ADD PRODUCT TO WISHLIST
router.post("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.userId },
      {
        $addToSet: { products: productId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate("products");

    res.status(200).json({
      message: "Product added to wishlist.",
      products: wishlist.products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product.",
    });
  }
});

// 3. REMOVE PRODUCT FROM WISHLIST
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.userId },
      {
        $pull: { products: productId },
      },
      { new: true }
    ).populate("products");

    res.status(200).json({
      message: "Product removed from wishlist.",
      products: wishlist?.products || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product.",
    });
  }
});

export default router;
