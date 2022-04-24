const mongoose = require('mongoose');
const config = require('../config')
const MONGODB_URI = config.MONGODB_URI

module.exports = async () => {
  const connection = await mongoose.connect(MONGODB_URI)
  return connection.connect.db;
}