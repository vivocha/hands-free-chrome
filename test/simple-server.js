"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Hapi = require("hapi");
const index_1 = require("../dist/index");
const screens_1 = require("../dist/screens");
const Joi = require("joi");
const debug = require("debug");
// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    port: process.env.PORT || 8000
});
const hfcOptions = {
    port: process.env.CHROME_PORT || 9222,
    autoSelectChrome: true,
    chromeFlags: ['--disable-gpu', '--headless']
};
const chrome = new index_1.HandsfreeChrome(hfcOptions);
// POST handler
const captureScreenshotHandler = async function (request, reply) {
    try {
        debug('capture invoked');
        const resType = request.payload.type === 'pdf' ? 'application/pdf' : 'image/png';
        const imgData = await chrome.captureScreenshotAsStream(request.payload.url, { outputType: request.payload.type, metrics: screens_1.BasicScreenMetrics });
        if (request.payload.thumbnail)
            return reply(chrome.resizePng(imgData, request.payload.thumbnail)).type(resType);
        else
            return reply(imgData).type(resType);
    }
    catch (error) {
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
};
// GET handler
const captureThumbnailHandler = async function (request, reply) {
    try {
        debug('capture invoked');
        const resType = 'image/png';
        const imgData = await chrome.captureScreenshotAsStream(request.params.url, { outputType: 'png', metrics: screens_1.BasicScreenMetrics });
        if (request.query.thumbnail) {
            const [width, height] = request.query.thumbnail.split(",").map(v => parseInt(v));
            return reply(chrome.resizePng(imgData, { width, height })).type(resType);
        }
        else
            return reply(imgData).type(resType);
    }
    catch (error) {
        reply(error);
    }
};

server.register(require('inert'), (err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./index.html');
        }
   
 });
});
// POST endpoint
server.route({
    method: 'POST',
    path: '/screenshots/actions/capture',
    config: captureConfig
});
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
};
// GET endpoint
server.route({
    method: 'GET',
    path: '/screenshots/{url}',
    config: thumbnailConfig
});


// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    else {
        console.log('Service started, config is:\n');
        console.dir(server.info);
    }
});


//# sourceMappingURL=api.js.map