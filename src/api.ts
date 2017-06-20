import * as Hapi from 'hapi';
import { HandsfreeChrome } from './index';
import * as Joi from 'joi';
import * as debug from 'debug';

// Create a server with a host and port
export const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: process.env.PORT || 8000
});

const chrome = new HandsfreeChrome();

const captureScreenshotHandler = async function (request, reply) {
    try {
        debug('capture invoked');
        const resType = request.payload.type === 'pdf' ? 'application/pdf' : 'image/png';
        const imgData = await chrome.captureScreenshotAsStream(request.payload.url, request.payload.type)
        return reply(imgData).type(resType);
    } catch (error) {
        reply(error);
    }
};

const captureConfig = {
    handler: captureScreenshotHandler,
    validate: {
        payload: {
            url: Joi.string().uri({
                scheme: ['http', 'https']
            }),
            type: Joi.string().default('png').valid('png', 'pdf')
        }
    }
}
// Add the route
server.route({
    method: 'POST',
    path: '/screenshots/actions/capture',
    config: captureConfig
});

// close chrome instance when API server is in stop state
server.on('stop', function () {
    console.log('closing server');
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

export async function stop() {
    await chrome.close();
    server.stop();
    return;
}


