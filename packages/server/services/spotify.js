'use config';

const fetch = require('node-fetch');

const API_BASE_URL = 'https://api.spotify.com/v1';

module.exports = { getPlaylist };

async function getPlaylist(spotifyAccessToken, playlistId) {
  const url = `${API_BASE_URL}/playlists/${playlistId}`;
  const options = {
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  };
  return fetch(url, options);
}
