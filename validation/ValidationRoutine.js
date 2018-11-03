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
  constructor() {}

  /**
   * First step in the star registration process
   * @param {*} address
   */
  async addStarRequest(address) {
    //TODO: Check is star request already exists
    //Check if alread star request
    // try {
    //   const savedRequestStr = await this.getValueFromDB(address);
    //   const savedRequest = JSON.parse(savedRequestStr);

    //   if (!isEmpty(savedRequest)) {
    //     return { message: `Address ${address} already waiting for validation` };
    //   }
    // } catch (error) {
    //   console.log("Error :", error);

    // }
    const timestamp = Date.now();
    const message = `${address}:${timestamp}:starRegistry`;
    const requestValidation = {
      address,
      requestTimestamp: timestamp,
      message,
      validationWindow: 300
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
  async validateMessageSignature(addressToCheck, signatureToCheck) {
    try {
      const savedRequestStr = await this.getValueFromDB(addressToCheck);
      const savedRequest = JSON.parse(savedRequestStr);

      if (isEmpty(savedRequest)) {
        return false;
      }

      if (savedRequest["status"] !== undefined) {
        if (savedRequest.status.messageSignature === "valid") {
          //TODO return validation with adapted time window
          const nowMinusFiveMinutes = Date.now() - 300 * 1000;
          let windowLeft =
            savedRequest.status.requestTimestamp - nowMinusFiveMinutes;
          if (windowLeft < 0) {
            try {
              await this.removeValidation(addressToCheck);
              return {
                message:
                  "The validation window is closed. The star registration request has been removed. Please make another request"
              };
            } catch (error) {
              console.log("ERROR:", error);
            }
          } else {
            //TODO: modify validationWindow, serialize, return
            const validationWindow = windowLeft;
            savedRequest.status.validationWindow = validationWindow;
            await this.makeSignatureValid(
              addressToCheck,
              JSON.stringify(savedRequest)
            );
            const modifiedRequest = await this.getValueFromDB(addressToCheck);
            return modifiedRequest;
          }
        }
      }

      const {
        address,
        message,
        validationWindow,
        requestTimestamp
      } = savedRequest;

      if (address !== addressToCheck) {
        //TODO: adapt return
        return false;
      }

      if (
        !this.isValidationWindowOpen(
          Date.now(),
          requestTimestamp,
          validationWindow
        )
      ) {
        //TODO: adapt return
        return false;
      }

      if (!bitcoinMessage.verify(message, addressToCheck, signatureToCheck)) {
        //TODO: adapt return
        return false;
      }

      const validResponse = {
        registerStar: true,
        status: {
          address: address,
          requestTimestamp: requestTimestamp,
          message: message,
          validationWindow: `${Math.floor(
            (Date.now() - requestTimestamp) / 1000
          )}`,
          messageSignature: "valid"
        }
      };
      await this.makeSignatureValid(addressToCheck, validResponse);

      return validResponse;
    } catch (err) {
      console.log(err);
      return {
        registerStar: false,
        ...savedRequest
      };
    }
  }

  removeValidation(address) {
    return db.del(address);
  }

  makeSignatureValid(address, validResponse) {
    return db.put(address, JSON.stringify(validResponse));
  }

  async isValidStarRegistrationAddress(addressToCheck) {
    //TODO: try/catch
    const saveRequestStr = await this.getValueFromDB(addressToCheck);
    const saveRequest = JSON.parse(saveRequestStr);
    if (savedRequest["status"] !== undefined) {
      return saveRequest.status.messageSignature === "valid" ? true : false;
    }
    return false;
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
