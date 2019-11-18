class BadRequestError extends Error {
  constructor(details) {
    super("Bad Request");
    this.details = details;
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
