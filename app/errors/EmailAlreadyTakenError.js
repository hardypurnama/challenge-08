const ApplicationError = require('./ApplicationError');

class EmailAlreadyTakenError extends ApplicationError {
  constructor() {
    super('Email already taken!');
  }
}

module.exports = EmailAlreadyTakenError;
