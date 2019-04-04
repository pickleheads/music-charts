'use strict';

require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const { apiRouter } = require('./routes');
const { dbConnectionMiddleware } = require('./controllers/db');
const { errorHandlingMiddleware } = require('./controllers/error');
const { spotifyAccessTokenMiddleware } = require('./controllers/spotify');

const PORT = process.env.PORT || 1337;

const app = express();

(async () => {
  app.use(bodyParser.json());
  app.use(await dbConnectionMiddleware());
  app.use(spotifyAccessTokenMiddleware());

  app.use('/api', apiRouter);
  // TODO: check how next works in relation to skipping other sibling middlewares
  app.use(errorHandlingMiddleware());

  app.listen(PORT, () =>
    console.log(`Music charts is running on port ${PORT}`)
  );
})();
