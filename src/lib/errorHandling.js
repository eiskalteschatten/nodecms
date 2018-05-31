'use strict';

module.exports = {
    returnError
};

function returnError(error, res) {
    if (error.statusCode) {
        res.status(error.statusCode).send(error.message);
    }
    else {
        const errorMessage = error.message || 'An error occurred.';
        console.error(error);
        res.status(500).send(errorMessage);
    }
}
