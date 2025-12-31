const isUnknownArgumentError = (err, argumentName) => {
  if (!err || !argumentName) return false;
  const message = err.message || "";
  return message.includes(`Unknown argument \`${argumentName}\``);
};

module.exports = { isUnknownArgumentError };
