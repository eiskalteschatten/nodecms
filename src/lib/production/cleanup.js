'use strict';

const path  = require('path');
const exec = require('child_process').exec;

const cssPath = path.join(__dirname, '../../public/css/');
const jsLibsPath = path.join(__dirname, '../../public/js/libs.js');
const jsScriptsPath = path.join(__dirname, '../../public/js/scripts.js');

module.exports = () => {
  return new Promise((resolve, reject) => {
    exec(`rm -r ${cssPath}`, error => {
      if (error) {
        reject(error);
      }

      console.log('Deleted CSS files');
      resolve();
    });
  }).then(() => {
    return new Promise((resolve, reject) => {
      exec(`rm ${jsLibsPath}`, error => {
        if (error) {
          reject(error);
        }

        console.log('Deleted libs.js');
        resolve();
      });
    });
  }).then(() => {
    return exec(`rm ${jsScriptsPath}`, error => {
      if (error) {
        throw new Error(error);
      }

      console.log('Deleted scripts.js');
      return;
    });
  }).catch(console.error);
};
