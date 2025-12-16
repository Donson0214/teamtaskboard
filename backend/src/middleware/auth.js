
const { admin } = require("../libs/firebase");
const prisma = require("../libs/prisma");

async function withRetry(fn, attempts = 3, baseDelay = 200) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable =
        err?.code === "P2010" ||
        /RetryableWriteError/i.test(err?.message || "") ||
        /IO error/i.test(err?.message || "");
      if (!isRetryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, baseDelay * (i + 1)));
    }
  }
  throw lastErr;
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const normalizedEmail = (decoded?.email || "").toLowerCase();
    if (!normalizedEmail) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const name = decoded?.name || decoded?.displayName || null;
    const imageUrl = decoded?.picture || decoded?.photoURL || null;

  
    const user = await withRetry(() =>
      prisma.user.upsert({
        where: { email: normalizedEmail },
        update: { name, imageUrl },
        create: {
          email: normalizedEmail,
          name,
          imageUrl,
        },
        select: { id: true, email: true, name: true, imageUrl: true, createdAt: true }
      })
    );

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    const isDbIssue =
      err?.code === "P2010" ||
      /RetryableWriteError/i.test(err?.message || "") ||
      /IO error/i.test(err?.message || "");
    const status = isDbIssue ? 503 : 401;
    const message = isDbIssue ? "Temporary database issue. Please retry." : "Invalid token";
    return res.status(status).json({ message });
  }
}

module.exports = { requireAuth };
