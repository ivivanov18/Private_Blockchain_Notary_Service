const express = require("express");
const router = express.Router();
const Blockchain = require("../../simpleChain").BlockChain;
const Block = require("../../simpleChain").Block;

let notaryBlockChain = new Blockchain();

router.get("/", async (req, res) => {
  try {
    console.log("TEST STARS STARS");
    res.json({ message: "It works" });
  } catch (error) {}
});

// TODO: Search by Blockchain Wallet Address
router.get("/address::addr", async (req, res) => {
  try {
    const { addr } = req.params;
    const foundBlocksForAddress = await notaryBlockChain.getBlocksByAddress(
      addr
    );
    res.json({ foundBlocksForAddress });
  } catch (error) {
    console.log(
      "error while fetching the blocks by their address. The error is :",
      error
    );
  }
});
// TODO: Search by Star Block Hash
router.get("/hash::hash", async (req, res) => {
  try {
    const { hash } = req.params;
    console.log("HASH FROM PARAMS:", hash);
    //TODO check whether null
    const blockFound = await notaryBlockChain.getBlockByHash(hash);
    res.json({ blockFound });
  } catch (error) {
    console.log("error in finding block. The error is: ", error);
  }
});

// TODO: Update Project README

module.exports = router;
