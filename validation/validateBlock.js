const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateBlock(data) {
  let errors = {};

  let { address, star } = data;
  let { dec, ra, story } = star;

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

  story = !isEmpty(story) ? story : "";
  //TODO: Length less than 250 words or 500 bytes
  if (!Validator.isByteLength(story, { min: 5, max: 500 })) {
    errors.storyLength = "The length of the story must be maximum 500 bytes.";
  }

  if (!Validator.isAscii(story)) {
    errors.storyAsciiCheck =
      "The story of the star must contain only ASCII characters";
  }

  if (Validator.isEmpty(story)) {
    errors.story = "The story of the star cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
