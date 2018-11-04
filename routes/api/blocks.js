const express = require("express");
const router = express.Router();
const Blockchain = require("../../simpleChain").BlockChain;
const Block = require("../../simpleChain").Block;

const validateBlock = require("../../validation/validateBlock");

const { ascii_to_hexa, hexa_to_ascii } = require("../../utils/converters");

/**
 * @route GET api/blocks/block/:height
 * @desc gets the block at the specified height
 * @access Public
 */
router.get("/block/:height", async (req, res) => {
  const blockchain = req.app.get("blockchain");

  const { height } = req.params;

  try {
    const block = await blockchain.getBlock(height);

    const story_in_ascii = hexa_to_ascii(block.body.star.story);

    res.status(200).json({
      blockRequested: {
        ...block,
        body: {
          ...block.body,
          star: {
            ...block.body.star,
            story: story_in_ascii
          }
        }
      }
    });
  } catch (error) {
    res.status(404).json({
      error: `Block at the requested height - ${height} - is not found`
    });
  }
});

//TODO: FIX RETURNED BLOCK AFTER CREATION
/**
 * @route POST api/blocks/block
 * @desc creates the block with the specified body
 * @access Public
 */
router.post("/block", async (req, res) => {
  const blockchain = req.app.get("blockchain");

  try {
    //TODO: check whether address has possibility to make registration

    const { isValid, errors } = validateBlock(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const { address, dec, ra, story } = req.body;

    const story_in_hex = ascii_to_hexa(story);

    const body = {
      address,
      star: {
        dec,
        ra,
        story: story_in_hex
      }
    };

    await blockchain.addBlock(new Block(body));
    const blockHeight = await blockchain.getBlockHeight();
    const lastBlock = await blockchain.getBlock(blockHeight);
    res.status(201).send({ blockAdded: lastBlock });
  } catch (error) {
    console.log(error);
  }
});

////////--------
const validateRequest = require("../../validation/validateRequest");

const ValidationRoutine = require("../../validation/ValidationRoutine");

/**
 * @route POST /requestValidation
 * @desc validates the address
 * @access Public
 */
router.post("/requestValidation", async (req, res) => {
  try {
    const validationRoutine = new ValidationRoutine();

    const { address } = req.body;
    const { isValid, errors } = validateRequest(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    await validationRoutine.addStarRequest(address);
    const response = await validationRoutine.getValueFromDB(address);
    res.status(201).send(JSON.parse(response));
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
