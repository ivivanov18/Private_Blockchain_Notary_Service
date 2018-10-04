const level = require("level");
const chainDB = "./validationbufferdata";
const db = level(chainDB, { createIfMissing: true }, function(err, db) {
  if (err instanceof level.errors.OpenError) {
    console.log("FAILED TO OPEN DATABASE");
  }
  return db;
});

class ValidationRoutine {
  constructor() {
    console.log("chainDB:   ", chainDB);
    console.log("DB ---- :", db);
  }

  async addStarRequest(address) {
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
