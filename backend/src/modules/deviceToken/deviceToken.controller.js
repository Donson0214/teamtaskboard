const service = require("./deviceToken.service");

async function registerDeviceToken(req, res) {
  try {
    const { token, platform } = req.body || {};
    const deviceToken = await service.registerDeviceToken(req.user.id, {
      token,
      platform,
    });

    res.status(201).json({
      success: true,
      data: deviceToken,
    });
  } catch (err) {
    console.error("Register device token failed:", err);
    const status = err.status || 500;
    res.status(status).json({
      message: err.message || "Failed to register device token",
    });
  }
}

module.exports = {
  registerDeviceToken,
};
