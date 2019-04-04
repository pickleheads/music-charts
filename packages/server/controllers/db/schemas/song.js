'use strict';

const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
  },
});

module.exports = { songSchema };
