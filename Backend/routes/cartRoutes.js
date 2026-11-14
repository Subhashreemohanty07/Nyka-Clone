
import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require customer login
router.use(authMiddleware);

router.use((req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Only customers can access their cart.",
    });
  }
  next();
});

// GET CUSTOMER CART
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.product");

    res.json({
      items: cart?.items || [],
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      message: "Unable to load cart.",
    });
  }
});

// ADD PRODUCT TO CART
router.post("/", async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      size = "",
      color = "",
    } = req.body;

    const qty = Number(quantity);

    if (
      !mongoose.isValidObjectId(productId) ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return res.status(400).json({
        message: "Invalid product or quantity.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    let cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user.userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        size,
        color,
      });
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      message: "Product added to cart.",
      items: cart.items,
    });
  } catch (error) {
    console.error("Add cart error:", error);
    res.status(500).json({
      message: "Unable to add product to cart.",
    });
  }
});

// UPDATE CART ITEM QUANTITY
router.patch("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const quantity = Number(req.body.quantity);

    if (
      !mongoose.isValidObjectId(itemId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Invalid cart item or quantity.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.product");

    res.json({
      message: "Cart updated.",
      items: cart.items,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      message: "Unable to update cart.",
    });
  }
});

// REMOVE PRODUCT FROM CART
router.delete("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        message: "Invalid cart item ID.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    cart.items.pull({ _id: itemId });

    await cart.save();
    await cart.populate("items.product");

    res.json({
      message: "Product removed from cart.",
      items: cart.items,
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.status(500).json({
      message: "Unable to remove product.",
    });
  }
});

export default router;
