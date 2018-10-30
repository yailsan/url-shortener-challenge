const uuidv4 = require('uuid/v4');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');


/* Dictionary */
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

/**
 * Lookup for existant, active shortened URLs by hash or url.
 * 'null' will be returned when no matches were found.
 * @param {string} searchString
 * @returns {object}
 */
async function getUrl(searchString) {
  let source = await UrlModel.findOne({ active: true, $or: [{ hash: searchString }, {url: searchString }] });
  return source;
}

/**
/**
 * Generate an unique hash-ish- for an URL, based on an id.
 * @param {string} id
 * @returns {string} hash
 */
function generateHash(id) {
  let num = parseInt(id, 16);
  let hash = '';

  while (num > 0) {
    hash = `${alphabet[num % alphabet.length]}${hash}`;
    num = Math.floor(num / alphabet.length);
  }

  return hash;
}

/**
 * Generate a random token that will allow URLs to be (logical) removed
 * @returns {string} uuid v4
 */
function generateRemoveToken() {
  return uuidv4();
}

/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @returns {object}
 */
async function shorten(url) {

  if (!isValid(url)) {
    throw new Error('Invalid URL');
  }

  // Check if url already exists in db
  // if exists return record 
  const foundUrl = await getUrl(url);
  if (foundUrl !== null) {
    return foundUrl;
  }

  // Get URL components for metrics sake
  const urlComponents = parseUrl(url);
  const protocol = urlComponents.protocol || '';
  const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
  const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

  // Generate a token that will alow an URL to be removed (logical)
  const removeToken = generateRemoveToken();

  // Create a new model instance
  const shortUrl = new UrlModel({
    url,
    protocol,
    domain,
    path,
    isCustom: false,
    removeToken,
    active: true
  });

  const newId = shortUrl._id.toString();
  // Pass the las 3 bytes from newly generated ObjectId
  const hash = generateHash(newId.slice(newId.length - 6));
  shortUrl.hash = hash;

  const saved = await shortUrl.save();
  return {
    url,
    shorten: `${SERVER}/${hash}`,
    hash,
    removeUrl: `${SERVER}/${hash}/remove/${removeToken}`
  };
}

/**
 * removeUrl
 * @param {string} hash
 * @param {string} removeToken
 * @return {object} 
 */
async function removeUrl (hash, removeToken) {
  return await UrlModel.deleteOne({ hash, removeToken });
}

/**
 * Validate URI
 * @param {any} url
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

module.exports = {
  shorten,
  getUrl,
  generateHash,
  generateRemoveToken,
  removeUrl,
  isValid
}
