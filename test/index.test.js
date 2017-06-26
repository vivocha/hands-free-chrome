const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
const md5 = require('md5');
const path = require('path');
chai.use(chaiAsPromised);

const { HandsfreeChrome } = require('../dist/index');
const { BasicScreenMetrics } = require('../dist/screens');
const findUp = require('find-up');

const today = new Date().toISOString().split('T')[0];

describe('HandsfreeChrome', function () {
  describe('#captureScreenshot (png default)', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });

    it('should create one not empty png file wikipedia JS page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/JavaScript');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    it('should create one SMALLER png file for wikipedia Sardegna page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/Sardegna', { outputType: 'png', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    it('should create one SMALLER png file for Corriere page', async function () {
      let filename = await chrome.captureScreenshot('http://www.corriere.it', { outputType: 'png', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    it('should create one SMALLER png file for BBC page', async function () {
      let filename = await chrome.captureScreenshot('http://www.bbc.com/sport', { outputType: 'png', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    it('should create one SMALLER png file for NY Times page', async function () {
      let filename = await chrome.captureScreenshot('https://www.nytimes.com', { outputType: 'png', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    it('should create one png file for NY Times page in a specified directory', async function () {
      let filename = await chrome.captureScreenshot('https://www.nytimes.com', { outputType: 'png', outputDir: 'screenshots/another-dir', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots/another-dir', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });
  describe('#captureScreenshot (generate THUMBNAIL)', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });
    it('should create a 160x100 png of NY Times page', async function () {
      let filename = await chrome.captureScreenshot('https://www.nytimes.com', { outputType: 'png', metrics: BasicScreenMetrics, thumbnail: { width: 160, height: 100 } });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });

  describe('#captureScreenshot (pdf)', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });

    it('should create one not empty pdf file wikipedia JS page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/JavaScript', { outputType: 'pdf', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.pdf`));
      file.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });

  describe('#captureScreenshot (both pdf and png)', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });

    it('should create two files wikipedia JS page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/JavaScript', { outputType: 'both', metrics: BasicScreenMetrics });
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      const pdfFile = await findUp(path.join('screenshots', today, `${filename}.pdf`));
      pdfFile.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });


  describe('#captureScreenshot', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });
    it('should create on file for CHROME page', async function () {
      let filename = await chrome.captureScreenshot('https://www.oracle.com/');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });

    it('should create one not empty file for a http page', async function () {
      let filename = await chrome.captureScreenshot('http://www.corriere.it');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
    /*
    it('Connecting to a wrong URL should fail', function () {
      return chrome.captureScreenshot('https://www.www.error.www.eu').should.be.rejected;
    });
    */
  });

  describe('#captureScreenshot(png default) setting a different port', function () {
    let chrome;
    const hfcOptions = {
      port: 9999,
      autoSelectChrome: true,
      chromeFlags: ['--disable-gpu', '--headless']
    };

    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome(hfcOptions);
      done();
    });

    it('should create one not empty png file wikipedia JS page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/JavaScript');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      const file = await findUp(path.join('screenshots', today, `${filename}.png`));
      file.should.be.ok;
      return filename;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });

  //Streams
  describe('#captureScreenshotAsStream', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome();
      done();
    });
    it('should create a stream for Chromestatus', async function () {
      let stream = chrome.captureScreenshotAsStream('https://www.chromestatus.com/');
      stream.should.be.fulfilled;
      let screenshotData = '';
      const dataStream = await stream;
      dataStream.on('data', chunk => {
        screenshotData += chunk;
      });
      dataStream.on('end', () => {
        screenshotData.length.should.be.above(0);
        return;
      });
    });

    it('should create a stream', async function () {
      let stream = chrome.captureScreenshotAsStream('https://it.wikipedia.org/wiki/Bug');
      stream.should.be.fulfilled;
      let screenshotData = '';
      const dataStream = await stream;
      dataStream.on('data', chunk => {
        screenshotData += chunk;
      });
      dataStream.on('end', () => {
        screenshotData.length.should.be.above(0);
        return;
      });
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });

  describe.skip('#captureScreenshot with no autodetect', function () {
    let chrome;
    before('Instantiate HandsfreeChrome', function (done) {
      chrome = new HandsfreeChrome({ autoSelectChrome: false, port: 9222, chromePath: '/tmp', chromeFlags: ['--disable-gpu', '--headless'] });
      done();
    });

    it('should fail', async function () {
      chrome.captureScreenshot('https://en.wikipedia.org/wiki/Node.js').should.be.rejected;
      return;
    });
    after('Close HandsfreeChrome ', function () {
      return chrome.close();
    });
  });

});






