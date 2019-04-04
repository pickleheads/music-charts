'use strict';

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  playlist: {
    ref: 'Playlist',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  song: {
    ref: 'Song',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = { voteSchema };
