const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRequest(data) {
  let errors = {};

  let { address } = data;

  address = !isEmpty(address) ? address : "";
  if (Validator.isEmpty(address)) {
    errors.address = "The address of the validation request cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
