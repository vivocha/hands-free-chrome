const fs = require('fs');
const url = require('url');
const util = require('util');
const http = require('http');
const https = require('https');
const debug = require('debug')('HFC:Main');
const uuid = require('uuid');
const lighthouse = require('lighthouse');
const chrome = require('chrome-remote-interface');
const { Launcher } = require('lighthouse/chrome-launcher/chrome-launcher');

const writeFile = util.promisify(fs.writeFile);


process.on('unhandledRejection', (reason, p) => {
  debug('Unhandled Rejection at:', p, 'REASON:', reason);
});

interface Options {
  port: number,
  autoSelectChrome: boolean,
  chromeFlags: string[],
  chromePath?: string
}

class HandsfreeChrome {
  launcher: any = null;
  protocol: any = null;
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

    let Page;
    const filename = `${uuid.v4()}-${new Date().toISOString()}`;
    try {
      if (!this.launcher.chrome) await this.launchChrome();
      if (!this.protocol) this.protocol = await chrome();
      Page = this.protocol.Page;
      await Page.enable();
      await Page.navigate({ url: url });
      await Page.loadEventFired();
      // screenshot -> png
      let { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
      await writeFile(`${filename}.png`, Buffer.from(data, 'base64'));
      // screenshot -> pdf
      //const { data: pdf } = await Page.printToPDF();
      //await writeFile(`${filename}.pdf`, Buffer.from(pdf, 'base64'));
      debug('all done.');      
      return filename;
    } catch (err) {
      debug(err);
      throw err;
    }
  };

  async close() {
    if (this.protocol) await this.protocol.close();
    if (this.launcher) await this.launcher.kill();
  }
}

module.exports = HandsfreeChrome;