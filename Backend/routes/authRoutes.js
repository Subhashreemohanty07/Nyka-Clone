import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import transporter from "../config/email.js";

const router = express.Router();


// Signup API
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      storeName,
      businessAddress,
      city,
      state,
      postalCode,
    } = req.body;

    // 1. Validate common required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // 2. Validate role
    const allowedRoles = ["customer", "vendor"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Please select a valid account type"
      });
    }

    // 3. Validate mobile number
    if (role !== "admin" && !mobile?.trim()) {
      return res.status(400).json({
        message: "Mobile number is required"
      });
    }

    if (role !== "admin" && !/^[0-9]{10}$/.test(mobile.trim())) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number"
      });
    }

    // 4. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    // 5. Validate vendor details
    if (role === "vendor") {
      if (
        !storeName?.trim() ||
        !businessAddress?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !postalCode?.trim()
      ) {
        return res.status(400).json({
          message: "Please fill in all required business details"
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 6. Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // 7. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Generate a random verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 9. Hash the verification token before saving it
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // 10. Set token expiry to 15 minutes
    const verificationExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // 11. Save user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: role === "admin" ? undefined : mobile.trim(),
      password: hashedPassword,
      role: role,

      isVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: verificationExpires,

      // Save business details only for vendors
      ...(role === "vendor" && {
        vendorDetails: {
          storeName: storeName.trim(),
          businessAddress: businessAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          status: "pending"
        }
      })
    });

    // 12. Create verification link
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // 13. Send verification email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Verify Your Nykaa Account",

        text: `Welcome to Nykaa! Please verify your email using this link: ${verificationLink}. This link expires in 15 minutes.`,

        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Welcome to Nykaa!</h2>

            <p>Thank you for registering with us.</p>

            <p>Please click the button below to verify your email address.</p>

            <a
              href="${verificationLink}"
              style="
                background-color: #e80071;
                color: white;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
              "
            >
              Verify My Email
            </a>

            <p>This verification link expires in 15 minutes.</p>

            <p>If you did not create this account, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      // Remove the newly created account if email sending fails
      await user.deleteOne();

      console.error("Email sending failed:", emailError);

      return res.status(500).json({
        message: "Unable to send verification email. Please try again."
      });
    }

    // 14. Send response to frontend
    return res.status(201).json({
      message: "Registration successful! Please check your email to verify your account."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Server error during signup"
    });
  }
});


// Verify Email API
router.post("/verify-email", async (req, res) => {
  try {
    const { email, token } = req.body;

    // 1. Check whether email and token are provided
    if (!email || !token) {
      return res.status(400).json({
        message: "Email and verification token are required"
      });
    }

    // 2. Hash the received token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 3. Find user with matching email and token
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      emailVerificationToken: hashedToken
    });

    // 4. Check whether the user and token exist
    if (!user) {
      return res.status(400).json({
        message: "Invalid verification link"
      });
    }

    // 5. Check whether email is already verified
    if (user.isVerified) {
      return res.status(200).json({
        message: "Email is already verified. Please sign in."
      });
    }

    // 6. Check whether the verification link has expired
    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Verification link has expired. Please register again or request a new link."
      });
    }

    // 7. Update email verification status
    user.isVerified = true;

    // 8. Clear token and expiry after successful verification
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    // 9. Send success response
    return res.status(200).json({
      message: "Email verified successfully! You can now sign in."
    });

  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message: "Server error during email verification"
    });
  }
});



//for sign in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    // 2. Find user in MongoDB
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    // 3. Check whether the user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 4. Compare entered password with stored hash
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
    // Check whether the user's email is verified
if (!user.isVerified) {
  return res.status(403).json({
    message: "Please verify your email before signing in."
  });
}

    // 5. Generate JWT token
const token = jwt.sign(
  { userId: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);


// 6. Send successful response with token
    return res.status(200).json({
      message: "Signin successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        vendorDetails: user.vendorDetails
      }
  });


  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error during signin"
    });
  }
});


// Forgot Password API
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate email
    if (!email?.trim()) {
      return res.status(400).json({
        message: "Please enter your email address"
      });
    }

    // 2. Find the user in MongoDB
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    // Use a generic response for security
    const successMessage =
      "If a verified account exists with this email, a password reset link will be sent.";

    if (!user || !user.isVerified) {
      return res.status(200).json({
        message: successMessage
      });
    }

    // 3. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 4. Hash the token before saving it
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 5. Set expiry to 15 minutes
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    // 6. Create password reset link
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // 7. Send reset email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Your Nykaa Password",

        text: `Click this link to reset your password: ${resetLink}. This link expires in 15 minutes.`,

        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Reset Your Nykaa Password</h2>

            <p>We received a request to reset your password.</p>

            <a
              href="${resetLink}"
              style="
                background-color: #e91e63;
                color: white;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
              "
            >
              Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>

            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      // Clear reset token if email sending fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      console.error("Reset email failed:", emailError);

      return res.status(500).json({
        message: "Unable to send reset email. Please try again."
      });
    }

    // 8. Send response
    return res.status(200).json({
      message: successMessage
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Server error during password reset request"
    });
  }
});

// Reset Password API
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // 1. Validate required fields
    if (!email?.trim() || !token || !newPassword) {
      return res.status(400).json({
        message: "Email, token and new password are required"
      });
    }

    // 2. Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    // 3. Hash the received reset token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 4. Find user using email and reset token
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedToken
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset link"
      });
    }

    // 5. Check token expiry
    if (
      !user.resetPasswordExpires ||
      user.resetPasswordExpires.getTime() < Date.now()
    ) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(400).json({
        message: "Password reset link has expired. Please request a new link."
      });
    }

    // 6. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 7. Update user's password
    user.password = hashedPassword;

    // 8. Clear reset token after successful password change
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // 9. Send success response
    return res.status(200).json({
      message: "Password reset successful! Please sign in with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error while resetting password"
    });
  }
});


// Protected Profile API
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Find the user using the ID from the verified token
    const user = await User.findById(req.user.userId).select("-password");

    // Check whether the user still exists
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Return the user's profile
    return res.status(200).json({
      message: "Profile fetched successfully",
      user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      vendorDetails: user.vendorDetails
    }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error while fetching profile"
    });
  }
}); 
export default router;