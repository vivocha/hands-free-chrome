const chai = require('chai');
const should = chai.should();
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const HandsFreeChrome = require('../dist/index.js');


describe('HandsFreeChrome', function () {

  describe('#captureScreenshot', function () {
    let chrome;
    before('Instantiate HandsFreeChrome', function (done) {
      chrome = new HandsFreeChrome();
      done();
    });

    it('should create two not empty files wikipedia JS page', async function () {
      let filename = await chrome.captureScreenshot('https://it.wikipedia.org/wiki/JavaScript');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      return filename;
    });
  });
  describe('#captureScreenshot', function () {
    let chrome;
    before('Instantiate HandsFreeChrome', function (done) {
      chrome = new HandsFreeChrome();
      done();
    });
    it('should create two not empty files for CHROME page', async function () {
      let filename = await chrome.captureScreenshot('https://www.chromestatus.com/');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      return filename;
    });



    it('should create two not empty files for a http page', async function () {
      let filename = await chrome.captureScreenshot('http://www.corriere.it');
      filename.should.be.ok;
      filename.length.should.be.above(1);
      return filename;
    });
    /*
    it('Connecting to a wrong URL should fail', function () {
      return chrome.captureScreenshot('https://www.www.error.www.eu').should.be.rejected;
    });
    */
  });

});


describe('#captureScreenshot with no autodetect', function () {
  it('should fail', async function () {
    let chrome = new HandsFreeChrome({ autoSelectChrome: false, port: 9222, chromePath: '/temp', chromeFlags: ['--disable-gpu', '--headless'] });
    chrome.captureScreenshot('https://en.wikipedia.org/wiki/Node.js').should.be.rejected;
    return;
  });
});




