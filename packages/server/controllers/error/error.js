'use strict';

module.exports = { errorHandlingMiddleware };

function errorHandlingMiddleware() {
  return (error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    res.status(error.status || 500).send({ error: error.stack });
  };
}
