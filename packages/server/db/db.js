'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_DB_URI = process.env.MONGO_DB_URI;

module.exports = { connect };

const playlistSchema = new mongoose.Schema({
  endDate: Date,
  spotifyId: {
    type: String,
    required: true,
  },
  startDate: Date,
});

const songSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
  },
});

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

async function connect() {
  const connection = await mongoose.createConnection(MONGO_DB_URI, {
    useNewUrlParser: true,
  });
  mongoose.model('Playlist', playlistSchema);
  mongoose.model('Song', songSchema);
  mongoose.model('Vote', voteSchema);
  return connection;
}
