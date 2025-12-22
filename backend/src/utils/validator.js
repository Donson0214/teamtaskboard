exports.validate = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error(result.error.issues?.[0]?.message || "Invalid payload");
    error.status = 400;
    throw error;
  }

  return result.data;
};

exports.validateQuery = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error(result.error.issues?.[0]?.message || "Invalid query params");
    error.status = 400;
    throw error;
  }

  return result.data;
};
