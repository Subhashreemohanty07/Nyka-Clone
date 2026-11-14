
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // 1. Basic product information
    productName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    // 2. Main category
    category: {
      type: String,
      enum: ["men", "women"],
      required: true
    },

    // 3. Clothing type
    subCategory: {
      type: String,
      required: true
    },

    // 4. Brand name
    brand: {
      type: String,
      required: true,
      trim: true
    },

    // 5. Product price
    price: {
      type: Number,
      required: true,
      min: 0
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0
    },

    // 6. Product images
    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
          type: String,
          default: null
        }
      }
    ],

    // 7. Available sizes
    sizes: {
      type: [String],
      required: true
    },

    // 8. Available colours
    colors: {
      type: [String],
      required: true
    },

    // 9. Available stock
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    // 10. Product rating
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    numReviews: {
      type: Number,
      default: 0,
      min:0
    },

    // 11. Vendor who added the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
