const ip = require('ip');
const VisitModel = require('./visitSchema');

/**
 * registerVisit
 * @param {string} urlId
 * @param {string} userAgent
 * @return {bool}
 */
async function registerVisit (urlId, userAgent) {
    const newVisit = await new VisitModel({
        urlId,
        userAgent,
        ip: ip.address()
    });

    return await newVisit.save();
}

module.exports = {
    registerVisit
};