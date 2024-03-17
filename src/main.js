import { Map, View } from 'ol';
import apply from 'ol-mapbox-style';

const map = new Map({
  target: 'map',
  controls: [],
  interactions: [],
  view: new View({
    center: [0, 0],
    zoom: 0,
    constrainOnlyCenter: true,
    multiWorld: true,
    maxResolution: 78271.5169640204,
  }),
});
window.map = map;

const tileRequestQueue = [];
let idle = true;

function nextMapImage() {
  if (tileRequestQueue.length > 0) {
    const { center, resolution, onrendercomplete } = tileRequestQueue.shift();
    map.getView().setCenter(center);
    map.getView().setResolution(resolution);
    map.once('rendercomplete', onrendercomplete);
  } else {
    idle = true;
  }
  return !idle;
}
window.nextMapImage = nextMapImage;

async function requestMapImage(center, resolution) {
  resolution = Math.min(resolution, 78271.5169640204);
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        reject(new Error('timeout'));
      }, 20000);
      const onrendercomplete = () => {
        clearTimeout(timeout);
        resolve();
      };
      if (idle) {
        idle = false;
        map.getView().setProperties({ center, resolution });
        map.once('rendercomplete', onrendercomplete);
      } else {
        tileRequestQueue.push({ center, resolution, onrendercomplete });
        return;
      }
    } catch (e) {
      reject(e);
    }
  });
}
window.requestMapImage = requestMapImage;

// these functions are provided via puppeteer or mocked for easy browser debugging
const mapError =
  window.mapError ||
  function (v) {
    console.error('mapError', v);
    return v;
  };
const mapReady =
  window.mapReady ||
  function () {
    console.log('mapReady');
  };

(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const style = urlParams.get('style');
    if (!style) {
      throw new Error('style parameter is required');
    }
    await apply(map, style, {
      transformRequest: (url) =>
        url.replace(/\/VectorTileServer$/, '/VectorTileServer/'),
    });
    mapReady();
  } catch (error) {
    mapError(error);
  }
})();
