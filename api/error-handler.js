const BadRequest = require("./bad-request");

module.exports = logger => function(err, req, res, next) {
  if (!err.statusCode) err.statusCode = 500;
  const response = { error: err.message };
  if (err instanceof BadRequest && err.details) {
    response.details = err.details;
  } else {
    logger.error(err);
    response.error = "Service unavailable";
  }
  res.status(err.statusCode).json(response);
};
