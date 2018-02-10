'use strict';

const translationsJson = require('../config/translations');

const moment = require('moment');

module.exports = {
  translate,
  getLocalizedDate
};

function translate(lang, string, locals) {
  const translations = translationsJson.translations;
  const langStrings = translations[lang];

  const useDefaultLangage = () => {
    const defaultStrings = translations[locals.defaultLanguage];

    if (defaultStrings && defaultStrings[string]) {
      return defaultStrings[string];
    }
  };

  if (langStrings && langStrings[string]) {
    return langStrings[string];
  }
  else {
    return useDefaultLangage();
  }
}

function getLocalizedDate(date, lang) {
  return moment(date).locale(lang).format('LLL');
}
