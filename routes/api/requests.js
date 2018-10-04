const express = require("express");
const router = express.Router();

const validateRequest = require("../../validation/validateRequest");

const ValidationRoutine = require("../../validation/ValidationRoutine");

/**
 * @route POST /requestValidation
 * @desc validates the address
 * @access Public
 */
router.post("/requestValidation", async (req, res) => {
  try {
    const validationRoutine = ValidationRoutine();

    const { address } = req.body;
    const { isValid, errors } = validateRequest(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const response = await validationRoutine.validationRoutine(address);
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;