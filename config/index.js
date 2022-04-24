const APP_PORT = process.env.APP_PORT || 8081
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trackmania'

module.exports = {
    APP_PORT,
    MONGODB_URI
}