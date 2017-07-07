import * as Hapi from 'hapi';
import { HandsfreeChrome } from './index';
import { ScreenMetrics, DesktopScreenMetrics, BasicScreenMetrics } from './screens';
import * as Joi from 'joi';
import * as dbg from 'debug';

const debug = dbg('HFC:API');

// Create API Server
export const server = new Hapi.Server();
server.connection({
    port: process.env.PORT || 8000
});

const hfcOptions = {
    port: process.env.CHROME_PORT || 9222,
    autoSelectChrome: true,
    chromeFlags: ['--disable-gpu', '--headless']
};

const chrome = new HandsfreeChrome(hfcOptions);
chrome.launchChrome();

// POST handler
const captureScreenshotHandler = async function (request, reply) {
    try {
        debug('capture invoked');
        const resType = request.payload.type === 'pdf' ? 'application/pdf' : 'image/png';
        const imgData = await chrome.captureScreenshotAsStreamByTab(request.payload.url, { outputType: request.payload.type, metrics: BasicScreenMetrics })
        if (request.payload.thumbnail) return reply(chrome.resizePng(imgData, request.payload.thumbnail)).type(resType);
        else return reply(imgData).type(resType);
    } catch (error) {
        debug(error);
        reply(error);
    }
};
// POST config 
const captureConfig = {
    handler: captureScreenshotHandler,
    validate: {
        payload: {
            url: Joi.string().uri({
                scheme: ['http', 'https']
            }).required(),
            type: Joi.string().default('png').valid('png', 'pdf'),
            thumbnail: Joi.object().keys({
                width: Joi.number(),
                height: Joi.number()
            })
        }
    }
}

// GET handler
const captureThumbnailHandler = async function (request, reply) {
    try {
        debug('capture invoked');
        const resType = 'image/png';
        const imgData = await chrome.captureScreenshotAsStreamByTab(request.params.url, { outputType: 'png', metrics: BasicScreenMetrics })
        if (request.query.thumbnail) {
            const [width, height] = request.query.thumbnail.split(",").map(v => parseInt(v));
            return reply(chrome.resizePng(imgData, { width, height })).type(resType);
        }
        else return reply(imgData).type(resType);
    } catch (error) {
        debug(error);
        reply(error);
    }
};

// GET configuration
const thumbnailConfig = {
    handler: captureThumbnailHandler,
    validate: {
        params: {
            url: Joi.string().uri({
                scheme: ['http', 'https']
            }).required()
        },
        query: {
            thumbnail: Joi.string().default('160,100')
        }
    }
}

// POST endpoint
server.route({
    method: 'POST',
    path: '/screenshots/actions/capture',
    config: captureConfig
});


// GET endpoint
server.route({
    method: 'GET',
    path: '/screenshots/{url}',
    config: thumbnailConfig
});

server.on('stop', function () {
    console.log('closing server');
});
// Start the server
server.start((err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    else {
        console.log('Service started, config is:\n');
        console.dir(server.info);
    }
});

// stop Chrome process and API server.
export async function stop() {
    await chrome.close();
    server.stop();
    return;
}


