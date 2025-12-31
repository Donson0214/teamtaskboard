const express = require("express");
const router = express.Router();
const { admin } = require("../../libs/firebase");
const prisma = require("../../libs/prisma");
const { requireAuth } = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { validate } = require("../../utils/validator");
const { sessionSchema } = require("./auth.validation");

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@taskflow.dev";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Demo123!";
const DEMO_NAME = process.env.DEMO_NAME || "Demo User";

const ensureDemoUser = async () => {
  try {
    const existing = await admin.auth().getUserByEmail(DEMO_EMAIL);
    const updated = await admin.auth().updateUser(existing.uid, {
      displayName: DEMO_NAME,
      password: DEMO_PASSWORD,
      emailVerified: true,
      disabled: false,
    });
    return updated;
  } catch (err) {
    if (err?.code !== "auth/user-not-found") throw err;
    return admin.auth().createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: DEMO_NAME,
      emailVerified: true,
    });
  }
};

router.post("/session", async (req, res) => {
  try {
    const { idToken } = validate(sessionSchema, req.body);

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

router.post("/demo", async (req, res) => {
  try {
    const firebaseUser = await ensureDemoUser();
    await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: { name: DEMO_NAME },
      create: { email: DEMO_EMAIL, name: DEMO_NAME },
    });
    const token = await admin.auth().createCustomToken(firebaseUser.uid);
    res.json({ token, email: DEMO_EMAIL, name: DEMO_NAME });
  } catch (err) {
    console.error("Demo auth error:", err);
    res.status(500).json({ message: "Failed to create demo session" });
  }
});


router.get("/me", requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
