const level = require("level");
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");

const isEmpty = require("../validation/isEmpty");

const chainDB = "./validationbufferdata";
const db = level(chainDB, { createIfMissing: true }, function(err, db) {
  if (err instanceof level.errors.OpenError) {
    console.log("FAILED TO OPEN DATABASE");
  }
  return db;
});

class ValidationRoutine {
  constructor() {
    //console.log("chainDB:   ", chainDB);
    //console.log("DB ---- :", db);
  }

  async addStarRequest(address) {
    const timestamp = Date.now();
    const message = `${address}:${timestamp}:starRegistry`;
    const requestValidation = {
      address,
      requestTimestamp: timestamp,
      message,
      validationWindow: 300000
    };

    this.addKeyValueToDB(address, JSON.stringify(requestValidation))
      .then(async () => {
        return await this.getValueFromDB(address);
      })
      .then(value => {
        console.log("VALUE: ", value);
        return value;
      })
      .catch(err => console.log("ERROR while creating record: ", err));
  }
  // TODO: Throw error instead of false
  async isSignatureValid(addressToCheck, signatureToCheck) {
    try {
      const savedRequestStr = await this.getValueFromDB(addressToCheck);
      console.log("SAVED REQUEST:", savedRequestStr);
      const savedRequest = JSON.parse(savedRequestStr);

      if (isEmpty(savedRequest)) {
        return false;
      }

      if (savedRequest === "valid") {
        console.log("already validated");
        return true;
      }

      const {
        address,
        message,
        validationWindow,
        requestTimestamp
      } = savedRequest;

      if (address !== addressToCheck) {
        return false;
      }

      if (
        !this.isValidationWindowOpen(
          Date.now(),
          requestTimestamp,
          validationWindow
        )
      ) {
        return false;
      }

      if (!bitcoinMessage.verify(message, addressToCheck, signatureToCheck)) {
        return false;
      }

      await this.makeSignatureValid(addressToCheck);
      console.log(await this.getValueFromDB(addressToCheck));

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  removeValidation(address) {
    return db.del(address);
  }

  makeSignatureValid(address) {
    return db.put(address, JSON.stringify("valid"));
  }

  async isValidStarRegistrationAddress(addressToCheck) {
    const validityFieldStr = await this.getValueFromDB(addressToCheck);
    const validityField = JSON.parse(validityFieldStr);

    return validityField === "valid" ? true : false;
  }

  /**
   * Helper
   *
   */
  isValidationWindowOpen(
    currentTimestamp,
    saveTimestamp,
    validationWindowSaved
  ) {
    const currentTime = currentTimestamp - saveTimestamp;
    console.log("CURRENT TIME:", currentTime);
    return currentTime < validationWindowSaved ? true : false;
  }

  /**
   * Function that adds a new key-value pair to the DB
   * @param {number} key - the address
   * @param {number} value - the timestamp
   * @return {Promise} as per the documentation of levelDB, w/o callback db.get returns a promise
   */
  addKeyValueToDB(key, value) {
    return db.put(key, value);
  }

  /**
   *
   * @param {number} key the address of the request
   * @return {Promise} as per the documentation of levelDB, w/o callback db.get returns a promise
   */
  getValueFromDB(key) {
    return db.get(key);
  }
}

module.exports = ValidationRoutine;
