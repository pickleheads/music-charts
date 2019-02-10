'use strict';

const express = require('express');
const db = require('./db');

const app = express();

app.use(async (req, res, next) => {
  req.db = await db.connect();
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

app.use((req, res) => {
  res.send("Hey, you shouldn't be here you chicken chicken chicken");
});

app.listen(1337, () => console.log('Music charts is running on port 1337'));
