const fs = require('fs');
const url = require('url');
const util = require('util');

const debug = require('debug')('HFC:Main');
const uuid = require('uuid');
const lighthouse = require('lighthouse');
const chrome = require('chrome-remote-interface');
const { Launcher } = require('lighthouse/chrome-launcher/chrome-launcher');

const writeFile = util.promisify(fs.writeFile);

interface Options {
  port: number,
  autoSelectChrome: boolean,
  chromeFlags: string[],
  chromePath?: string
}

class HandsfreeChrome {
  launcher: any;
  constructor(opts: Options = { port: 9222, autoSelectChrome: true, chromeFlags: ['--disable-gpu', '--headless'] }) {
    try {
      this.launcher = new Launcher(opts);
    } catch (err) {
      debug(err);
      throw err;
    }
  }

  /**
   * Launches Chrome, if not already started.
   */
  async launchChrome() {
    try {
      return await this.launcher.launch();
    } catch (error) {
      debug('launchChrome() Error', error);
      await this.launcher.kill();
      throw error;
    }
  }

  /**
   * Captures a screenshot of the page at specified URL.
   * It generates two files: a png image and a pdf document.
   * @param {string} url - complete URL of the webpage to take a screenshot
   * @returns {Promise} - resolved to filename string, in case of success.
   */
  async captureScreenshot(url) {
    let protocol;
    let Page;
    const filename = `${uuid.v4()}-${new Date().toISOString()}`;
    try {
      await this.launchChrome();
      protocol = await chrome();
      Page = protocol.Page;
      await Page.enable();
      await Page.navigate({ url: url });
      await Page.loadEventFired();
      debug('Capturing a screenshot...');
      let { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
      await writeFile(`${filename}.png`, Buffer.from(data, 'base64'));
      debug('generating a pdf...');
      const { data: pdf } = await Page.printToPDF();
      await writeFile(`${filename}.pdf`, Buffer.from(pdf, 'base64'));
      debug('all done.');
    } catch (err) {
      debug(err);
      throw err;
    } finally {
      if (protocol) protocol.close();
      this.launcher.kill();
      return filename;
    }
  };
}

module.exports = HandsfreeChrome;