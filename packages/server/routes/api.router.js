'use strict';

const router = require('express').Router();
const playlistRouter = require('./playlist');

module.exports = router;

router.use('/playlist', playlistRouter);
