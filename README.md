# Hands-free Chrome

[Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome) utilities.



[![travis build](https://img.shields.io/travis/vivocha/mongodoki.svg)](https://travis-ci.org/vivocha/hands-free-chrome)
[![Coverage Status](https://coveralls.io/repos/github/vivocha/mongodoki/badge.svg?branch=master)](https://coveralls.io/github/vivocha/hands-free-chrome?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/vivocha/mongodoki/badge.svg)](https://snyk.io/test/github/vivocha/hands-free-chrome)
[![npm version](https://img.shields.io/npm/v/mongodoki.svg)](https://www.npmjs.com/package/hands-free-chrome)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Current supported features:
- capture screenshots of web pages, generating png and pdf files.




## Prerequisites


[Chrome version > 59.x](https://www.google.com/chrome/browser/desktop/index.html) must be installed.

**Node.js version > 8.0.0**


---
## Quick Start

```
npm install hands-free-chrome
```
then:

```js
const HandsFreeChrome = require('hands-free-chrome');

let chrome = new HandsFreeChrome();
chrome.captureScreenshot('<A VALID WEB PAGE URL>')
  .then(name => console.log(`Created files: ${name}.png and ${name}.pdf`))
  .catch(err => console.log(err));
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
