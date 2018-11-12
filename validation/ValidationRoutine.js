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
   * @throws will throw error if there is a problem during removal of closed validation
   */
  async addStarRequest(address) {
    //TODO: improve when message-signature valid and request to add a star for same address
    try {
      const data = await this.getValueFromDB(address);
      const savedRequest = JSON.parse(data);

      // In case a record exists for this address and signature has been validated
      if (!isEmpty(savedRequest.status)) {
        return JSON.stringify(savedRequest);
      }

      const nowMinusFiveMinutes = Date.now() - 300 * 1000;
      let windowLeft = savedRequest.requestTimestamp - nowMinusFiveMinutes;
      if (windowLeft < 0) {
        try {
          await this.removeValidation(address);
          const response = JSON.stringify({
            message:
              "The validation window is closed. Please make another request"
          });
          return response;
        } catch (error) {
          console.log("ERROR while removing closed validation:", error);
          throw "Error while removing closed validation for address provided";
        }
      } else {
        const validationWindow = Math.floor(windowLeft / 1000);
        savedRequest.validationWindow = validationWindow;
        await this.addKeyValueToDB(address, JSON.stringify(savedRequest));

        const updatedRequest = await this.getValueFromDB(address);
        return updatedRequest;
      }
    } catch (error) {
      //There is not record for the provided address - there is no request for it
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
   * @throws Will throw an error if the address is not in the DB
   * @throws Will throw an error if the validation window is not open anymore
   * @throws Will throw an error if the signature provided is not valid
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
    const validResponseToSerializeInDB = JSON.stringify(validResponse);
    await this.addKeyValueToDB(addressToCheck, validResponseToSerializeInDB);

    return validResponse;
  }

  async isValidStarRegistrationAddress(addressToCheck) {
    try {
      const savedRequestStr = await this.getValueFromDB(addressToCheck);
      const savedRequest = JSON.parse(savedRequestStr);
      if (!isEmpty(savedRequest.status)) {
        return savedRequest.status.messageSignature === "valid" ? true : false;
      }
      return false;
    } catch (error) {
      throw `The address ${addressToCheck} cannot add star to the blockchain. Please make a request for validation`;
    }
  }

  /**
   * Helper function to verify if the validation window is opend
   * meaning whether the user can use the current request for validation to verify
   * the signature
   *
   */
  isValidationWindowOpen(
    currentTimestamp,
    saveTimestamp,
    validationWindowSaved
  ) {
    const currentTime = currentTimestamp - saveTimestamp;
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

  removeValidation(address) {
    return db.del(address);
  }
}

module.exports = ValidationRoutine;
