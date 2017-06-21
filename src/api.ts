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

const hfcOptions = {
    port: process.env.CHROME_PORT || 9222,
    autoSelectChrome: true,
    chromeFlags: ['--disable-gpu', '--headless']
};

const chrome = new HandsfreeChrome(hfcOptions);

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
// Add the route for the captureScreenshot API endpoint
server.route({
    method: 'POST',
    path: '/screenshots/actions/capture',
    config: captureConfig
});


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

// stop Chrome process and API server.
export async function stop() {
    await chrome.close();
    server.stop();
    return;
}


