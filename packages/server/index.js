'use strict';

const express = require('express');
const db = require('./db');
const fetch = require('node-fetch');
require('dotenv').config();
const bodyParser = require('body-parser');
const _ = require('lodash');

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const app = express();

app.use(bodyParser.json());

app.use(async (req, res, next) => {
  req.db = await db.connect();
  const url = 'https://accounts.spotify.com/api/token';
  const base64Str = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  const options = {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Str}`,
    },
  };
  const response = await fetch(url, options);
  console.log({ OK: response.ok });
  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
  req.spotifyAccessToken = json.access_token;
  next();
});

app.get('/', async (req, res) => {
  const songs = await req.db.model('Song').find({});
  res.send({ songs });
});

app.get('/songs/:song', async (req, res) => {
  const song = req.params.song;
  await req.db.model('Song').create({ spotifyId: song });
  res.send();
});

app.post('/playlist', async (req, res, next) => {
  const playlistURL = req.body.url;
  if (!_.isString(playlistURL)) {
    const error = new Error(
      `Supplied playlist URL "${playlistURL}" is not valid`
    );
    error.status = 400;
    return next(error);
  }

  const match = playlistURL.match(
    /(?<=https:\/\/open\.spotify\.com\/(user\/\w+\/)?playlist\/).+?(?=(\?|$))/
  );
  const playlistId = _.get(match, '0');
  // TODO: throw error if playlist id doesnt exist
  if (!_.isString(playlistId)) {
    const error = new Error (
      `Supplied playlist ID ${playlistId} is not valid`
    );
    error.status = 400;
    return next(error);
  }
  const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
  const options = {
    headers: {
      Authorization: `Bearer ${req.spotifyAccessToken}`,
    },
  };
  const response = await fetch(url, options);
  console.log({ OK: response.ok });
  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
  const playlist = await req.db
    .model('Playlist')
    .create({ spotifyId: playlistId });
  res.status(202).send({ playlist });
});

app.use((req, res) => {
  res.send("Hey, you shouldn't be here you chicken chicken chicken");
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.status || 500).send({ error: error.stack });
});

app.listen(1337, () => console.log('Music charts is running on port 1337'));
