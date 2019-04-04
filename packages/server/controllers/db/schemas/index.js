'use strict';

const { playlistSchema: playlist } = require('./playlist');
const { songSchema: song } = require('./song');
const { voteSchema: vote } = require('./vote');

module.exports = {
  playlist,
  song,
  vote,
};
