const express = require("express");
const router = express.Router();
const Blockchain = require("../../simpleChain").BlockChain;

////////-------- UTILS --------
const { ascii_to_hexa, hexa_to_ascii } = require("../../utils/converters");

router.get("/address::addr", async (req, res) => {
  const notaryBlockChain = new Blockchain();

  try {
    const { addr } = req.params;
    const foundBlocksForAddress = await notaryBlockChain.getBlocksByAddress(
      addr
    );
    let foundsBlocksWithStoryDecoded = [];
    const values = Object.values(foundBlocksForAddress);
    values.forEach(block => {
      story_in_ascii = hexa_to_ascii(block.body.star.story);
      foundsBlocksWithStoryDecoded.push({
        ...block,
        body: {
          ...block.body,
          star: {
            ...block.body.star,
            storyDecoded: story_in_ascii
          }
        }
      });
    });

    res.json({ foundsBlocksWithStoryDecoded });
  } catch (error) {
    const errorMsg = {
      error: `Error while fetching the blocks by their address. The error is : 
      ${error}`
    };
    res.status(400).send(errorMsg);
  }
});

router.get("/hash::hash", async (req, res) => {
  const notaryBlockChain = new Blockchain();

  try {
    const { hash } = req.params;
    //TODO check whether null
    const blockFound = await notaryBlockChain.getBlockByHash(hash);
    const story_in_ascii = hexa_to_ascii(blockFound.body.star.story);

    res.status(200).json({
      blockRequested: {
        ...blockFound,
        body: {
          ...blockFound.body,
          star: {
            ...blockFound.body.star,
            storyDecoded: story_in_ascii
          }
        }
      }
    });
  } catch (error) {
    res.status(400).send({ error });
  }
});

module.exports = router;
