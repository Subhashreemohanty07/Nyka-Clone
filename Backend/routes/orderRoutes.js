
import express from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// ROLE CHECK
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "You are not authorized to access this resource.",
    });
  }

  next();
};

// POST /api/orders
// CUSTOMER PLACES AN ORDER
router.post("/", allowRoles("customer"), async (req, res) => {
  const { addressId, paymentMethod = "COD" } = req.body;

  if (!mongoose.isValidObjectId(addressId)) {
    return res.status(400).json({
      message: "Please select a valid delivery address.",
    });
  }

  if (paymentMethod !== "COD") {
    return res.status(400).json({
      message: "Only Cash on Delivery is currently supported.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const userId = req.user.userId;

      // Verify the address belongs to the customer
      const address = await Address.findOne({
        _id: addressId,
        user: userId,
      }).session(session);

      if (!address) {
        const error = new Error("Delivery address not found.");
        error.statusCode = 404;
        throw error;
      }

      // Get cart from MongoDB
      const cart = await Cart.findOne({ user: userId })
        .session(session);

      if (!cart || cart.items.length === 0) {
        const error = new Error("Your cart is empty.");
        error.statusCode = 400;
        throw error;
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.items) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          const error = new Error("Invalid cart quantity.");
          error.statusCode = 400;
          throw error;
        }

        // Read current product details
        const product = await Product.findById(item.product)
          .session(session);

        if (!product) {
          const error = new Error(
            "A product in your cart is no longer available."
          );
          error.statusCode = 400;
          throw error;
        }

        // Atomically reduce stock only if enough is available
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            `Insufficient stock for ${product.productName}.`
          );
          error.statusCode = 400;
          throw error;
        }

        const price = Number(
          product.discountPrice ?? product.price
        );

        subtotal += price * item.quantity;

        orderItems.push({
          product: product._id,
          vendor: product.createdBy,
          productName: product.productName,
          brand: product.brand,
          image: product.images?.[0]?.url || "",
          price,
          quantity: item.quantity,
          size: item.size || "",
          color: item.color || "",
        });
      }

      // Snapshot of selected delivery address
      const deliveryAddress = {
        addressType: address.addressType,
        fullName: address.fullName,
        phone: address.phone,
        house: address.house,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      };

      const deliveryCharge = 0;

      const orders = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            deliveryAddress,
            paymentMethod: "COD",
            paymentStatus: "Pending",
            orderStatus: "Placed",
            subtotal,
            deliveryCharge,
            totalAmount: subtotal + deliveryCharge,
          },
        ],
        { session }
      );

      createdOrder = orders[0];

      // Empty cart only after creating the order
      await Cart.updateOne(
        { _id: cart._id },
        { $set: { items: [] } },
        { session }
      );
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Place order error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Unable to place order. Please try again.",
    });
  } finally {
    await session.endSession();
  }
});

// GET /api/orders/my
// CUSTOMER SEES THEIR OWN ORDERS
router.get("/my", allowRoles("customer"), async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("Customer orders error:", error);
    return res.status(500).json({
      message: "Unable to fetch your orders.",
    });
  }
});

// GET /api/orders/vendor
// VENDOR SEES THEIR PRODUCTS AND CUSTOMER DETAILS
router.get("/vendor", allowRoles("vendor"), async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const orders = await Order.find({
      "items.vendor": vendorId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Only expose this vendor's items and totals
    const vendorOrders = orders.map((order) => {
      const vendorItems = order.items.filter(
        (item) => String(item.vendor) === vendorId
      );

      const vendorSubtotal = vendorItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        _id: order._id,
        customer: order.user
          ? {
              _id: order.user._id,
              name: order.user.name,
              email: order.user.email,
            }
          : null,
        deliveryAddress: order.deliveryAddress,
        items: vendorItems,
        subtotal: vendorSubtotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    return res.json({ orders: vendorOrders });
  } catch (error) {
    console.error("Vendor orders error:", error);
    return res.status(500).json({
      message: "Unable to fetch vendor orders.",
    });
  }
});

// GET /api/orders/admin
// ADMIN SEES ALL ORDERS
router.get("/admin", allowRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.vendor", "name email")
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
});

// GET /api/orders/admin/customers/:customerId
// ADMIN SEES ORDERS OF ONE CUSTOMER
router.get(
  "/admin/customers/:customerId",
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!mongoose.isValidObjectId(customerId)) {
        return res.status(400).json({
          message: "Invalid customer ID.",
        });
      }

      const orders = await Order.find({
        user: customerId,
      })
        .populate("user", "name email")
        .populate("items.vendor", "name email")
        .sort({ createdAt: -1 });

      return res.json({ orders });
    } catch (error) {
      console.error("Admin customer orders error:", error);
      return res.status(500).json({
        message: "Unable to fetch customer orders.",
      });
    }
  }
);

 // GET /api/orders/:orderId/receipt
 // DOWNLOAD RECEIPT FOR CUSTOMER'S OWN ORDER

router.get(
  "/:orderId/receipt",
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { orderId } = req.params;

      // Validate order ID
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // Find only this customer's order
      const order = await Order.findOne({
        _id: orderId,
        user: req.user.userId,
      }).lean();

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      // Create PDF
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Nykaa-Receipt-${order._id}.pdf"`
      );

      doc.pipe(res);

      // RECEIPT HEADER
      doc
        .fontSize(24)
        .fillColor("#fc2779")
        .text("NYKAA CLONE", { align: "center" });

      doc
        .fontSize(15)
        .fillColor("#333333")
        .text("ORDER RECEIPT", { align: "center" });

      doc.moveDown(2);

      // ORDER INFORMATION
      doc.fontSize(11).fillColor("#000000");

      doc.text(`Order ID: ${order._id}`);
      doc.text(
        `Order Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`
      );
      doc.text(`Order Status: ${order.orderStatus}`);
      doc.text(`Payment Method: ${order.paymentMethod}`);
      doc.text(`Payment Status: ${order.paymentStatus}`);

      doc.moveDown(1.5);

      // DELIVERY ADDRESS
      const address = order.deliveryAddress || {};

      doc.fontSize(14).text("Delivery Address");
      doc.moveDown(0.5);
      doc.fontSize(11);

      doc.text(`Name: ${address.fullName || ""}`);
      doc.text(`Phone: ${address.phone || ""}`);

      doc.text(
        [
          address.house,
          address.area,
          address.city,
          address.state,
        ]
          .filter(Boolean)
          .join(", ")
      );

      doc.text(`Pincode: ${address.pincode || ""}`);

      doc.moveDown(1.5);

      // ORDERED PRODUCTS
      doc.fontSize(14).text("Ordered Products");
      doc.moveDown();

      for (const item of order.items) {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        doc.fontSize(11).fillColor("#000000");

        doc.text(`Product: ${item.productName || "Product"}`);
        doc.text(`Brand: ${item.brand || "N/A"}`);
        doc.text(`Quantity: ${quantity}`);
        doc.text(`Unit Price: Rs. ${price.toFixed(2)}`);
        doc.text(
          `Item Total: Rs. ${(price * quantity).toFixed(2)}`
        );

        if (item.size) {
          doc.text(`Size: ${item.size}`);
        }

        if (item.color) {
          doc.text(`Colour: ${item.color}`);
        }

        doc.moveDown();
      }

      // PAYMENT SUMMARY
      doc.moveDown();
      doc.fontSize(14).text("Payment Summary");
      doc.moveDown(0.5);

      doc.fontSize(11);
      doc.text(
        `Subtotal: Rs. ${Number(order.subtotal || 0).toFixed(2)}`
      );
      doc.text(
        `Delivery Charge: Rs. ${Number(order.deliveryCharge || 0).toFixed(2)}`
      );

      doc.moveDown(0.5);

      doc
        .fontSize(15)
        .fillColor("#fc2779")
        .text(
          `Total Amount: Rs. ${Number(order.totalAmount || 0).toFixed(2)}`
        );

      doc.moveDown(2);

      doc
        .fontSize(9)
        .fillColor("#777777")
        .text(
          "Thank you for shopping with Nykaa Clone!",
          { align: "center" }
        );

      doc.text(
        "This is an order receipt, not proof of payment.",
        { align: "center" }
      );

      // Finish PDF
      doc.end();

    } catch (error) {
      console.error("Receipt generation error:", error);

      if (!res.headersSent) {
        return res.status(500).json({
          message: "Unable to generate receipt.",
        });
      }

      res.destroy(error);
    }
  }
);


export default router;
