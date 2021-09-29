const sqlite3 = require('sqlite3').verbose()
let db

/**
 * This function is used to initialize the Database
 * @param {callback} callback
 * @return {String} Database
 */
function init_db (callback) {
  if (db === undefined) {
    db = new sqlite3.Database('data/data.db', (err) => {
      if (err) {
        return callback(false, err.message)
      } else {
        return callback(true, 'OK')
      }
    })
  }
  return db
}

module.exports = { init_db }
