"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Hapi = require("hapi");
const index_1 = require("../dist/index");
const Joi = require("joi");
// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});
const chrome = new index_1.HandsfreeChrome();
const captureScreenshotHandler = async function (request, reply) {
    console.log('capture invoked with: ', request.payload);
    const resType = request.payload.type === 'pdf' ? 'application/pdf' : 'image/png';
    const imgData = await chrome.captureScreenshotAsStream(request.payload.url, request.payload.type);
    return reply(imgData).type(resType);
};
const captureConfig = {
    handler: captureScreenshotHandler,
    validate: {
        payload: {
            url: Joi.string().uri({
                scheme: [
                    'http', 'https'
                ]
            }),
            type: Joi.string().default('png').valid('png', 'pdf')
        }
    }
};
// Add the route
server.route({
    method: 'POST',
    path: '/screenshots/actions/capture',
    config: captureConfig
});



server.register(require('inert'), (err) => {

    if (err) {
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
// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
});
//# sourceMappingURL=api.js.map