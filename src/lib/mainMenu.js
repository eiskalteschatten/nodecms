'use strict';

const Exhibition = require('../models/Exhibition');

const itemLimit = 4;

module.exports = async () => {
  const newExhibitions = await Exhibition.getLatest(itemLimit);

  return {
    newExhibitions: newExhibitions
  };
};
