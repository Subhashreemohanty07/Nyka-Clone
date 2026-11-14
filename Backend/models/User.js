
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Common fields for customers and vendors
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  mobile: {
    type: String,
    required: function () {
      return this.role !== "admin";
    },
    trim: true
  },

  password: {
    type: String,
    required: true
  },
    // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpires: {
    type: Date,
    default: null
  },

  // Email verification fields
  isVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: {
    type: String,
    default: null
  },

  emailVerificationExpires: {
    type: Date,
    default: null
  },

  // Admin invitation fields
  adminInviteToken: {
    type: String,
    default: null
  },

  adminInviteExpires: {
    type: Date,
    default: null
  },

  // Defines whether the user is a customer or vendor
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer",
    required: true
  },

 
  // Vendor-specific details
  vendorDetails: {
    storeName: {
      type: String,
      trim: true
    },

    businessAddress: {
      type: String,
      trim: true
    },

    city: {
      type: String,
      trim: true
    },

    state: {
      type: String,
      trim: true
    },

    postalCode: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  }

});

const User = mongoose.model("User", userSchema);

export default User;
