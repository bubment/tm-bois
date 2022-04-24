const { Router } = require('express')
const replays = require('./replays')

module.exports = () => {
    const app = Router();
    replays(app)
    return app
}