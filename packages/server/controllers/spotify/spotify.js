'use strict';

const fetch = require('node-fetch');

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

function spotifyAccessTokenMiddleware() {
  return async (req, res, next) => {
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
  };
}

module.exports = { spotifyAccessTokenMiddleware };
