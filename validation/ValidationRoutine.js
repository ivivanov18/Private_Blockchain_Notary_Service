const level = require("level");
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");

const isEmpty = require("../validation/isEmpty");
const wrapper = require("../utils/wrapper");

const chainDB = "./validationbufferdata";
const db = level(chainDB, { createIfMissing: true }, function(err, db) {
  if (err instanceof level.errors.OpenError) {
    console.log("FAILED TO OPEN DATABASE");
  }
  return db;
});

class ValidationRoutine {
  constructor() {}

  /**
   * First step in the star registration process
   * @param {*} address
   */
  async addStarRequest(address) {
    //TODO: improve when message-signature valid and request to add a star for same address
    try {
      const data = await this.getValueFromDB(address);
      const savedRequest = JSON.parse(data);

      const nowMinusFiveMinutes = Date.now() - 300 * 1000;
      let windowLeft = savedRequest.requestTimestamp - nowMinusFiveMinutes;
      if (windowLeft < 0) {
        try {
          await this.removeValidation(address);
          //TODO: Fix when deleted --> error notFound
          const response = JSON.stringify({
            message:
              "The validation window is closed. Please make another request"
          });
          return response;
        } catch (error) {
          console.log("ERROR:", error);
        }
      } else {
        const validationWindow = Math.floor(windowLeft / 1000);
        savedRequest.validationWindow = validationWindow;
        await this.addKeyValueToDB(address, JSON.stringify(savedRequest));

        const updatedRequest = await this.getValueFromDB(address);
        return updatedRequest;
      }
    } catch (error) {
      const timestamp = Date.now();
      const message = `${address}:${timestamp}:starRegistry`;
      const requestValidation = {
        address,
        requestTimestamp: timestamp,
        message,
        validationWindow: 300
      };

      await this.addKeyValueToDB(address, JSON.stringify(requestValidation));
      const blockFromDB = await this.getValueFromDB(address);
      return blockFromDB;
    }
  }

  /**
   *
   * @param {string} addressToCheck
   * @param {string} signatureToCheck
   * @return response for the validation
   */
  async validateMessageSignature(addressToCheck, signatureToCheck) {
    const { error, data } = await wrapper(this.getValueFromDB(addressToCheck));
    if (error) {
      throw `The address ${addressToCheck} is not present in the DB.`;
    }

    const savedRequest = JSON.parse(data);

    const {
      address,
      message,
      validationWindow,
      requestTimestamp
    } = savedRequest;

    if (address !== addressToCheck) {
      throw `The address ${addressToCheck} does not match to existing.`;
    }

    if (
      !this.isValidationWindowOpen(
        Date.now(),
        requestTimestamp,
        validationWindow
      )
    ) {
      throw `The validation window when to register the star for the address ${addressToCheck} is not open anymore. Please make another request.`;
    }

    if (!bitcoinMessage.verify(message, addressToCheck, signatureToCheck)) {
      throw `The signature is not valid for the address ${addressToCheck}.`;
    }

    const validResponse = {
      registerStar: true,
      status: {
        address: address,
        requestTimestamp: requestTimestamp,
        message: message,
        validationWindow: `${Math.floor(
          (requestTimestamp - Date.now() + 300 * 1000) / 1000
        )}`,
        messageSignature: "valid"
      }
    };
    await this.makeSignatureValid(addressToCheck, validResponse);

    return validResponse;
  }

  removeValidation(address) {
    return db.del(address);
  }

  makeSignatureValid(address, validResponse) {
    return db.put(address, JSON.stringify(validResponse));
  }

  async isValidStarRegistrationAddress(addressToCheck) {
    try {
      const savedRequestStr = await this.getValueFromDB(addressToCheck);
      const savedRequest = JSON.parse(savedRequestStr);
      if (!isEmpty(savedRequest.status)) {
        return savedRequest.status.messageSignature === "valid" ? true : false;
      }
    } catch (error) {
      throw `The address ${addressToCheck} cannot add star to the blockchain. Please make a request for validation`;
    }
  }

  async doesStarRequestExist(address) {
    try {
      const { error, data } = await wrapper(this.getValueFromDB(address));
      if (!error) {
        console.log("Data type: ", typeof data);
        return true;
      }
      console.log("Data type: ", typeof data);

      return false;
    } catch (error) {
      console.error("Error: ", error);
      console.log("Data type: ", typeof data);

      return false;
    }
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
    return currentTime < validationWindowSaved * 1000 ? true : false;
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
