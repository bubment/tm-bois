//Test comment
const express = require('express');
const path = require('path');
const apis = require('../routers')
const staticViews = require('../services/staticViewService')

module.exports = ({ app }) => {
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.json());

    app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'ejs');

    app.get('/', staticViews.indexPage);

    app.get('/official-campaigns/:year/:season', staticViews.officialCampaignPage);

    app.use('/api',apis())
}

