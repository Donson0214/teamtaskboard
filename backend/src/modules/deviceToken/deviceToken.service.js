const prisma = require("../../libs/prisma");

async function registerDeviceToken(userId, { token, platform }) {
  const trimmedToken = (token || "").trim();
  if (!trimmedToken) {
    const err = new Error("Token is required");
    err.status = 400;
    throw err;
  }

  const payload = {
    userId,
    token: trimmedToken,
    platform: platform || "web",
  };

  return prisma.deviceToken.upsert({
    where: { token: trimmedToken },
    update: {
      userId,
      platform: payload.platform,
    },
    create: payload,
  });
}

module.exports = {
  registerDeviceToken,
};
