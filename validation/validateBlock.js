const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateBlock(data) {
  let errors = {};

  let { body } = data;

  body = !isEmpty(body) ? body : "";
  if (Validator.isEmpty(body)) {
    errors.body = "The body of the block cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
