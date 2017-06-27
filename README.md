# Hands-free Chrome

[Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome) utilities.



[![travis build](https://img.shields.io/travis/vivocha/hands-free-chrome.svg)](https://travis-ci.org/vivocha/hands-free-chrome)
[![Coverage Status](https://coveralls.io/repos/github/vivocha/hands-free-chrome/badge.svg?branch=master)](https://coveralls.io/github/vivocha/hands-free-chrome?branch=master)
[![npm version](https://img.shields.io/npm/v/hands-free-chrome.svg)](https://www.npmjs.com/package/hands-free-chrome)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Current supported features:
- capture screenshots of web pages, generating png and/or pdf files.
- resize png screenshots to generate thumbnails




## Prerequisites


[Chrome version > 59.x](https://www.google.com/chrome/browser/desktop/index.html) must be installed.

**Node.js version > 8.1.0**


---
## Quick Start

```sh
$ npm install hands-free-chrome
```
then:

```js
const HandsfreeChrome = require('hands-free-chrome');

let chrome = new HandsfreeChrome();

//capture a screenshot as png
chrome.captureScreenshot('<A VALID WEB PAGE URL>')
  .then(name => console.log(`Created file: ${name}.png`))
  .catch(err => console.log(err));
```
___

## API

**`new HandsfreeChrome( [options] )`**

Constructor.

Instantiate a new HandsFreeChrome.

`options` is an *optional* object with the following properties:

- `port` -  integer, Headless Chrome listening port, default: `9999`;
- `autoSelectChrome` -  boolean, enable/disable autoselection of installed Chrome, default: `true` (recommended);
- `chromeFlags` -  array of strings, Headless Chrome configuration, default: `['--disable-gpu', '--headless']`;

---
**`HandsfreeChrome # captureScreenshot(url, [options])`**

Capture a screenshot of a web page and create image files.

Params:

- `url` - string, a valid web page URL;
- `options` - (optional) Object, screenshot configuration, with the following properties:
    - `outputType` - (optional) string, specifies the output file type, can be: `png` (default), `pdf` or `both`;
    - `outputDir` - (optional) string, directory path to contain generated screenshots. Default is `<cwd>/screenshots`;
    - `metrics` - object, screen metric properties, defaults to `DesktopScreenMetrics`, see the dedicated section below;
    - `thumbnail` - (optional) object `{ width: <px>, height: <px> }`, if used produces a resized png of the screenshot of the specified dimensions. It works only if `outputType` is `png`.

---
**`HandsfreeChrome # captureScreenshotAsStream(url, [options])`**

Capture a screenshot of a web page and return a data readable stream.

Params:

- `url` - string, a valid web page URL;
- `options` - (optional) Object, screenshot configuration, with the following properties:
    - `outputType` - (optional) string, specifies the image file type, can be: `png` (default) or `pdf`;
    - `metrics` - object, screen metric properties, defaults to `DesktopScreenMetrics`, see the dedicated section below.
---

**`HandsfreeChrome # resizePng(pngStream, [size])`**

Resize a png image given its stream and a size.

Params:

- `pngStream` - Readable image stream;
- `size` - (optional) object `{ width: <px>, height: <px> }`, the size of the required thumbnail. If not provided, default is: `{ width: 320, height: 200 }`.

---
### Metrics Object

Metrics Object specifies some configuration options for Headless Chrome, like the browser window size, mobile emulation and so on. See [Chrome DevTools Protocol page](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/) for more info.

Supported params are: 
```js
  width: number;
  height: number;
  deviceScaleFactor: (optional) number;
  mobile: (optional) boolean;
  fitWindow: (optional) boolean;
```
If `metrics` param is not specified or undefined in the above methods calls, then it defaults to: `DesktopScreenMetrics`, set as follows:

```js
{
  width: 1920,
  height: 1080,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false
}
```



---
## Web API Server
A Web API Server is now included in the package in order to expose the lib as Microservice.

After installing the npm package, running:

```sh
$ node ./node_modules/hands-free-chrome/dist/api
```

it starts a HTTP server at `localhost`, default port: `8000`.

To start the API server listening at a different port, just set the `PORT` environment variable.

To start the underlying Headless Chrome instance at a different port, set the `CHROME_PORT` environment variable (default is `9222`).


Example:

```sh
$ PORT=8080 node ./node_modules/hands-free-chrome/dist/api
```
### Endpoints

**POST /screenshots/actions/capture**

Sends a request to capture a screenshot.
It returns a response with a base64 encoded stream body with `Content-Type` equal to `image/png` or `application/pdf`.

POST body must be a JSON object with the following properties:

- `url`: (Required) string, complete URL of the page to capture;
- `type`: (Optional) string, image type for the requested screenshot: `png` or `pdf` (default is `png`);
- `thumbnail` - (optional) object in the form of `{ width: <px>, height: <px> }` to generate a thumbnail. If not provided a "full" screenshot is returned. It works only if `type` is `png`.

Example:

```js
{
  "url": "https://en.wikipedia.org/wiki/Node.js",
  "type": "png"
}
```

---

License - "MIT License"
-----------------------

Copyright (c) 2017 Vivocha S.p.A.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
