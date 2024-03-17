import { generateTile } from './ol.js';

const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * @param {import("express").Application} app
 */
export default (app) => {
  app.use('/tiles/:z/:x/:y.:format', async (req, res, next) => {
    const tileCoord = [
      Number(req.params.z),
      Number(req.params.x),
      Number(req.params.y),
    ];
    const mimeType = mimeTypes[req.params.format];
    const style = req.query.style;
    if (!style) {
      return res.status(400).send('style parameter is required');
    }
    if (!mimeType) {
      return res.status(400).send(`format ${req.params.format} not supported`);
    }
    try {
      const binary = await generateTile(mimeType, style, tileCoord);
      res.type(mimeType);
      res.send(binary);
    } catch (error) {
      next(error);
    }
  });
};
