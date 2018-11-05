const express = require("express");
const router = express.Router();
const Blockchain = require("../../simpleChain").BlockChain;

router.get("/address::addr", async (req, res) => {
  const notaryBlockChain = new Blockchain();

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

router.get("/hash::hash", async (req, res) => {
  const notaryBlockChain = new Blockchain();

  try {
    const { hash } = req.params;
    //TODO check whether null
    const blockFound = await notaryBlockChain.getBlockByHash(hash);
    res.json({ blockFound });
  } catch (error) {
    console.log("error in finding block. The error is: ", error);
  }
});

module.exports = router;
