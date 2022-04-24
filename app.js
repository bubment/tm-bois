const express = require('express');
const config = require('./config')
const PORT = config.APP_PORT
const app = express();

async function startServer() {
  await require('./loaders')({ expressApp: app});

  app.listen(PORT, err => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(`
      ####################################
         Server listening on port: ${PORT}
      ####################################
    `);
  })
}

startServer();

module.exports = app