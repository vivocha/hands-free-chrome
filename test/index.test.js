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
    after('Close HandsFreeChrome ', function () {
      return chrome.close();
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
    after('Close HandsFreeChrome ', function () {
      return chrome.close();
    });
    /*
    it('Connecting to a wrong URL should fail', function () {
      return chrome.captureScreenshot('https://www.www.error.www.eu').should.be.rejected;
    });
    */
  });

});


describe.skip('#captureScreenshot with no autodetect', function () {
  let chrome;
  before('Instantiate HandsFreeChrome', function (done) {
    chrome = new HandsFreeChrome({ autoSelectChrome: false, port: 9222, chromePath: '/tmp', chromeFlags: ['--disable-gpu', '--headless'] });
    done();
  });

  it('should fail', async function () {
    chrome.captureScreenshot('https://en.wikipedia.org/wiki/Node.js').should.be.rejected;
    return;
  });
  after('Close HandsFreeChrome ', function () {
    return chrome.close();
  });
});




