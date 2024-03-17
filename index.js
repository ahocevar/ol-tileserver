import express, { static as serveStatic } from 'express';
import api from './lib/api.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(serveStatic('dist'));

api(app);

app.listen(port, () => console.log(`ol-tileserver listening on port ${port}.`));
