'use strict';

const _ = require('lodash');
const moment = require('moment');
const router = require('express').Router();
const { spotify } = require('../../services');

module.exports = router;

// TODO: Move this to a controller file
router.post('/', async (req, res, next) => {
  const playlistURL = req.body.url;
  if (!_.isString(playlistURL)) {
    const error = new Error(
      `Supplied playlist URL "${playlistURL}" is not valid`
    );
    error.status = 400;
    return next(error);
  }
  const endDate = req.body.endDate && moment(req.body.endDate);
  const startDate = req.body.startDate && moment(req.body.startDate);
  try {
    validateDates(startDate, endDate);
  } catch (error) {
    error.status = 400;
    return next(error);
  }

  const playlistId = getPlaylistIdFromPlaylistUrl(playlistURL);
  if (!playlistId) {
    const error = new Error('Invalid Spotify localPlaylist ID supplied');
    error.status = 400;
    return next(error);
  }

  let response;
  try {
    response = await spotify.getPlaylist(req.spotifyAccessToken, playlistId);
  } catch (error) {
    error.status = 500;
    return next(error);
  }

  if (!response.ok) {
    const json = await response.json();
    const message = _.get(json, 'error.message');
    const error = new Error(
      `Failed to fetch Spotify playlist with id "${playlistId}":\n${message}`
    );
    error.status = 500;
    return next(error);
  }

  const spotifyPlaylist = await response.json();
  console.log(JSON.stringify(spotifyPlaylist, null, 2));
  let localPlaylist;
  try {
    localPlaylist = await req.db.model('Playlist').create({
      ...(endDate && { endDate: endDate.toDate() }),
      ...(startDate && { startDate: startDate.toDate() }),
      spotifyId: playlistId,
    });
  } catch (error) {
    error.status = 500;
    return next(error);
  }
  res.status(202).send({ playlist: localPlaylist });
});

router.get('/', async (req, res, next) => {
  const date = moment(req.query.date);
  const doesDateExist = !!req.query.date;
  if (doesDateExist && !date.isValid()) {
    const error = new Error('Invalid date supplied');
    error.status = 400;
    return next(error);
  }
  const dateQuery = {
    endDate: { $gte: date.toDate() },
    startDate: { $lte: date.toDate() },
  };
  const query = { ...(doesDateExist && dateQuery) };
  let playlists;
  try {
    playlists = await req.db
      .model('Playlist')
      .find(query)
      .lean()
      .exec();
  } catch (error) {
    error.status = 500;
    return next(error);
  }
  if (!playlists || playlists.length === 0) {
    const error = new Error('No playlists exist');
    error.status = 404;
    return next(error);
  }
  const playlistPromises = playlists.map(async playlist => {
    let response;
    const playlistId = playlist.spotifyId;
    response = await spotify
      .getPlaylist(req.spotifyAccessToken, playlistId)
    const responseValue = await response.json();
    if (!response.ok) {
      const message = _.get(responseValue, 'error.message');
      throw new Error(
        `Failed to fetch Spotify playlist with id "${playlistId}":\n${message}`
      );
    }
    return { ...playlist, spotifyPlaylist: responseValue };
  });
  let completePlaylists;
  try {
    completePlaylists = await Promise.all(playlistPromises);
  } catch (error) {
    error.status = 500;
    return next(error);
  }
  res
    .status(200)
    .send({ playlists: completePlaylists, count: completePlaylists.length });
});

// TODO: Move to controller for this function / figure out a better place for this
function getPlaylistIdFromPlaylistUrl(playlistURL) {
  const match = playlistURL.match(
    /(?<=https:\/\/open\.spotify\.com\/(user\/\w+\/)?playlist\/).+?(?=(\?|$))/
  );
  return _.first(match);
}

// TODO: Where should this live
function validateDates(startDate, endDate) {
  if (startDate && !startDate.isValid()) {
    throw new Error(`Supplied start date "${startDate}" is not valid`);
  }
  if (endDate && !endDate.isValid()) {
    throw new Error(`Supplied end date "${endDate}" is not valid`);
  }
  if ((endDate && !startDate) || (startDate && !endDate)) {
    throw new Error('A start and end date must be supplied together');
  }
  if (!startDate.isBefore(endDate)) {
    throw new Error('Start date must be before end date');
  }
}
