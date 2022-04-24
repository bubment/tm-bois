const mongooseLoader = require('./mongoose');
const expressLoader = require('./express');

module.exports = async ({ expressApp }) => {
    await mongooseLoader();
    // console.log('Connection to the DB:\t SUCCESS!');

    await expressLoader({ app: expressApp });
    // console.log('Express loaded:\t SUCCESS!');
}
