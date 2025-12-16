const express = require("express");
const router = express.Router();
const { admin } = require("../../libs/firebase");
const prisma = require("../../libs/prisma");
const { requireAuth } = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

router.post("/session", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const normalizedEmail = (decoded.email || "").toLowerCase();
    if (!normalizedEmail) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: decoded.name || null,
        imageUrl: decoded.picture || null,
      },
      create: {
        email: normalizedEmail,
        name: decoded.name || null,
        imageUrl: decoded.picture || null,
      },
      select: { id: true, email: true, name: true, imageUrl: true, createdAt: true }
    });

    res.json({
      success: true,
      user,
      decoded,
    });
  } catch (err) {
    console.error("Auth session error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});


router.get("/me", requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
