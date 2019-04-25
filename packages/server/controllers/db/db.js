'use strict';

const mongoose = require('mongoose');
const path = require('path');
const schemas = require('./schemas/index');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGO_DB_URI = process.env.MONGO_DB_URI;

module.exports = { dbConnectionMiddleware };

async function dbConnectionMiddleware() {
  const dbConnection = await _connect();
  return (req, res, next) => {
    req.db = dbConnection;
    return next();
  };
}

async function _connect() {
  const connection = await mongoose.createConnection(MONGO_DB_URI, {
    useNewUrlParser: true,
  });
  mongoose.model('Playlist', schemas.playlist);
  mongoose.model('Song', schemas.song);
  mongoose.model('Vote', schemas.vote);
  return connection;
}
