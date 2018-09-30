/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require("crypto-js/sha256");

/* ===== LevelBD Javascript  ===============================
|  Learn more: Level: https://github.com/Level/level  |
|  =========================================================*/
const level = require("level");
const chainDB = "./blockchaindata";
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    (this.hash = ""),
      (this.height = 0),
      (this.body = data),
      (this.time = 0),
      (this.previousBlockHash = "");
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  /**
   * Constructor for the Blockchain class. The constructor checks blockheight from DB
   */
  constructor() {
    this.getBlockHeight()
      .then(result => {
        // Checks blockheight
        if (result === -1) {
          console.log("There are no blocks in the blockchain. Adding Genesis");
          this.addBlock(new Block("First block in the chain - Genesis block"))
            .then(result =>
              console.log("Genesis block was added to the blockchain")
            )
            .catch(err => console.log(err));
        }
      })
      .catch(err =>
        console.log("There was an error in the Blockchain construction!", err)
      );
  }

  /**
   * Function that fills in the necessary fields for the new block:
   * hash, height, timestamp and finally adds it the DB
   * @param {object} newBlock
   */
  async addBlock(newBlock) {
    let blockHeight = await this.getBlockHeight();

    newBlock.height = blockHeight + 1;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString();

    if (newBlock.height > 0) {
      const lastBlock = await this.getBlock(blockHeight);
      newBlock.previousBlockHash = lastBlock.hash;
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Adding block object to chain
    this.addBlockToDB(newBlock.height, JSON.stringify(newBlock))
      .then(() => {
        return this.getBlockFromDB(newBlock.height);
      })
      .then(value => value)
      .catch(function(err) {
        console.error(err);
      });
  }

  /**
   * Function that returns the block height
   * @return {number} the block height
   */
  async getBlockHeight() {
    return await this.getBlockHeightFromDB();
  }

  /**
   *
   * @param {number} blockHeight
   * @return {Block} block for the given height
   */
  async getBlock(blockHeight) {
    return JSON.parse(await this.getBlockFromDB(blockHeight));
  }

  /**
   * Function that validates the provided block
   * @param {number} blockHeight of the corresponding block in the DB
   * @return {boolean} true if block valid, false otherwise
   */
  async validateBlock(blockHeight) {
    // get block object

    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = "";
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log(
        "Block #" +
          blockHeight +
          " invalid hash:\n" +
          blockHash +
          "<>" +
          validBlockHash
      );
      return false;
    }
  }

  /**
   * Function that validates the whole exisint blockchain in the DB
   * @return {boolean} true if valid
   */
  async validateChain() {
    let errorLog = [];

    const blockHeight = await this.getBlockHeight();
    for (var i = 0; i < blockHeight; i++) {
      // validate block
      if (!(await this.validateBlock(i))) errorLog.push(i);
      // compare blocks hash link
      let currentBlockHash = (await this.getBlock(i)).hash;
      let nextBlockPreviousBlockHash = (await this.getBlock(i + 1))
        .previousBlockHash;

      if (currentBlockHash !== nextBlockPreviousBlockHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log("Block errors = " + errorLog.length);
      console.log("Blocks: " + errorLog);
    } else {
      console.log("No errors detected");
    }
  }

  /**
   * Function that adds a new block to the DB
   * @param {int} key - the height of the block
   * @param {object} value the block
   * @return {Promise} as per the documentation of levelDB, w/o callback db.get returns a promise
   */
  addBlockToDB(key, value) {
    return db.put(key, value);
  }

  /**
   *
   * @param {number} key the height of the block
   * @return {Promise} as per the documentation of levelDB, w/o callback db.get returns a promise
   */
  getBlockFromDB(key) {
    return db.get(key);
  }

  /**
   * @return {Promise}
   */
  getBlockHeightFromDB() {
    return new Promise((resolve, reject) => {
      let height = -1;

      db.createReadStream()
        .on("data", function(data) {
          height++;
          //console.log(data.key, "=", data.value);
        })
        .on("error", function(err) {
          console.log("There was an error: ", err);
          reject(err);
        })
        .on("close", function() {
          console.log("Stream closed");
        })
        .on("end", function() {
          console.log("Stream ended");
          resolve(height);
        });
    });
  }
}

module.exports.BlockChain = Blockchain;
module.exports.Block = Block;
