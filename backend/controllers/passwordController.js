const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendEmail } = require("../services/brevoService");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetLink = `http://127.0.0.1:5500/frontend/reset-password.html?token=${token}`;

    const htmlContent = `
      <h2>Reset Password</h2>
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail(user.email, user.name, "Reset Your Password", htmlContent);

    res.status(200).json({
      message: "Reset password link sent to your email"
    });
  } catch (error) {
    console.log("Forgot password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }

    const user = await User.findOne({
      where: { resetToken: token }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid reset token"
      });
    }

    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({
        message: "Reset token expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.log("Reset password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};