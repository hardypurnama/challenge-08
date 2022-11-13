const ApplicationError = require('./ApplicationError');

class RecordNotFoundError extends ApplicationError {
  constructor() {
    super(`Car not found!`);
  }
}

module.exports = RecordNotFoundError;
