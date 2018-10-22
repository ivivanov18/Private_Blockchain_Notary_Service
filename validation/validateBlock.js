const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateBlock(data) {
  let errors = {};

  let { address, dec, ra, story } = data;

  address = !isEmpty(address) ? address : "";
  if (Validator.isEmpty(address)) {
    errors.address = "The address of registration of the star cannot be empty";
  }

  dec = !isEmpty(dec) ? dec : "";
  if (Validator.isEmpty(dec)) {
    errors.dec = "The declination of the star cannot be empty";
  }

  ra = !isEmpty(ra) ? ra : "";
  if (Validator.isEmpty(ra)) {
    errors.ra = "The right_ascension of the star cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
