'use strict';

const express = require('express');
const db = require('./db');
const fetch = require('node-fetch');
require('dotenv').config();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const app = express();

(async () => {})();

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

app.get('/playlist/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId;
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
  res.send(json);
});

app.use((req, res) => {
  res.send("Hey, you shouldn't be here you chicken chicken chicken");
});

//TODO: add error handling middleware

app.listen(1337, () => console.log('Music charts is running on port 1337'));
