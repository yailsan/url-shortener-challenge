const router = require('express').Router();
const url = require('./url');
const visit = require('../visit/visit');


router.get('/:hash', async (req, res, next) => {

  const source = await url.getUrl(req.params.hash);

  // If the hash wasn't found return a 404
  if (source === null) {
    const urlNotFound = new Error('Could not found a url associated with that hash');
    urlNotFound.status = 404;
    return next(urlNotFound);
  }

  // Register visit
  try {
    await visit.registerVisit(source._id, req.get('User-Agent'));
  } catch (e) {}


  // Behave based on the requested format using the 'Accept' header.
  // If header is not provided or is */* redirect instead.
  const accepts = req.get('Accept');

  switch (accepts) {
    case 'text/plain':
      res.end(source.url);
      break;
    case 'application/json':
      res.json(source);
      break;
    default:
      res.redirect(source.url);
      break;
  }
});


router.post('/', async (req, res, next) => {

  // if no url return error message
  const bodyURL = req.body.url;
  if (!bodyURL || bodyURL === '') {
    const noUrl = new Error('No URL was given');
    noUrl.status = 400;
    next(noUrl);
  }

  try {
    let shortUrl = await url.shorten(req.body.url);
    res.json(shortUrl);
  } catch (e) {
    if (e.message === 'Invalid URL') {
      e.message = 'It seems to be an error with the supplied url, please check it and submit again.';
    }
    next(e);
  }
});


router.delete('/:hash/:removeToken', async (req, res, next) => {
  const { hash, removeToken } = req.params;

  try {
    const deletedUrl = await url.removeUrl(hash, removeToken);
    return res.json(deletedUrl);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
