function errorHandler(res, err) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";

  console.error("[ERROR]", status, message, err?.code || "");
  if (err?.stack) console.error(err.stack);

  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
