function errorHandler(res, err) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";

  // Avoid dumping circular Prisma errors to console
  console.error("[ERROR]", status, message, err?.code || "");
  if (err?.stack) console.error(err.stack);

  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
