
import express from "express";
import mongoose from "mongoose";
import Address from "../models/Address.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in customers can manage addresses
router.use(authMiddleware);

router.use((req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Only customers can manage addresses.",
    });
  }
  next();
});

// Allowed address fields
const addressFields = [
  "addressType",
  "fullName",
  "phone",
  "house",
  "area",
  "city",
  "state",
  "pincode",
];

const requiredFields = [
  "fullName",
  "phone",
  "house",
  "area",
  "city",
  "state",
  "pincode",
];

function validateAddress(data) {
  for (const field of requiredFields) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      return `${field} is required.`;
    }
  }

  if (!/^[0-9]{10}$/.test(data.phone.trim())) {
    return "Phone must contain 10 digits.";
  }

  if (!/^[0-9]{6}$/.test(data.pincode.trim())) {
    return "Pincode must contain 6 digits.";
  }

  if (
    data.addressType !== undefined &&
    !["Home", "Work", "Other"].includes(data.addressType)
  ) {
    return "Invalid address type.";
  }

  return null;
}

// GET ALL SAVED ADDRESSES
router.get("/", async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      message: "Unable to load addresses.",
    });
  }
});

// ADD NEW ADDRESS
router.post("/", async (req, res) => {
  try {
    const data = {};

    for (const field of addressFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    const validationError = validateAddress(data);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const userId = req.user.userId;

    const existingCount = await Address.countDocuments({
      user: userId,
    });

    const address = await Address.create({
      ...data,
      user: userId,
      isDefault: existingCount === 0,
    });

    res.status(201).json({
      message: "Address saved successfully.",
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      message: "Unable to save address.",
    });
  }
});

// UPDATE SAVED ADDRESS
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    for (const field of addressFields) {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    }

    const validationError = validateAddress(
      address.toObject()
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    await address.save();

    res.json({
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      message: "Unable to update address.",
    });
  }
});

// SET DEFAULT ADDRESS
router.patch("/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    await Address.updateMany(
      { user: userId },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.json({
      message: "Default address updated.",
      address,
    });
  } catch (error) {
    console.error("Default address error:", error);
    res.status(500).json({
      message: "Unable to set default address.",
    });
  }
});

// DELETE SAVED ADDRESS
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    // If default was deleted, select another address
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        user: userId,
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      message: "Unable to delete address.",
    });
  }
});

export default router;
