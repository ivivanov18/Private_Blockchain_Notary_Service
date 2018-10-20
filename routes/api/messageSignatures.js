const express = require("express");
const router = express.Router();

const validateRequest = require("../../validation/validateRequest");

const ValidationRoutine = require("../../validation/ValidationRoutine");

/**
 * @route POST /message-signature/validation
 * @desc validates the address
 * @access Public
 */
router.post("/validation", async (req, res) => {
  try {
    const validationRoutine = new ValidationRoutine();

    const { address, signature } = req.body;
    const { isValid, errors } = validateRequest(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const response = await validationRoutine.isSignatureValid(
      address,
      signature
    );
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
