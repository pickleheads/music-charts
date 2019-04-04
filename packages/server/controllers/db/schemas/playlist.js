'use strict';

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  endDate: Date,
  spotifyId: {
    type: String,
    required: true,
  },
  startDate: Date,
});

module.exports = { playlistSchema };
