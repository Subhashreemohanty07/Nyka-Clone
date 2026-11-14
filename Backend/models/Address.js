
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    // CUSTOMER WHO OWNS THIS ADDRESS
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ADDRESS TYPE
    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    // CUSTOMER DETAILS
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/,
    },

    // DELIVERY ADDRESS
    house: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/,
    },

    // DEFAULT DELIVERY ADDRESS
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
