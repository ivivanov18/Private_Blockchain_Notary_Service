const express = require("express");
const router = express.Router();

const validateRequest = require("../../validation/validateRequest");

const ValidationRoutine = require("../../validation/ValidationRoutine");

/**
 * @route POST /message-signature/validate
 * @desc validates the signature of the message received at the star request
 * @access Public
 */
router.post("/validate", async (req, res) => {
  try {
    const validationRoutine = new ValidationRoutine();

    const { address, signature } = req.body;
    const { isValid, errors } = validateRequest(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const response = await validationRoutine.validateMessageSignature(
      address,
      signature
    );
    res.status(201).send(response);
  } catch (error) {
    res.status(400).send({ error });
  }
});

module.exports = router;
