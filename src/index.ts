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

type OutType = 'png' | 'pdf' | 'both';

class HandsfreeChrome {
  launcher: any = null;
  protocol: any = null;
  constructor(opts: Options = { port: 9222, autoSelectChrome: true, chromeFlags: ['--disable-gpu', '--headless'] }) {
    this.launcher = new Launcher(opts);
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
   * It can generate two files: a png image and|or a pdf document.
   * @param {string} url - complete URL of the webpage to take a screenshot
   * @param {string} outputType - file format for the ouput file, can be 'png', 'pdf' or 'both'
   * @returns {Promise} - resolved to filename string, in case of success.
   */
  async captureScreenshot(url: string, outputType: OutType = 'png') {
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
      if (outputType === 'png' || outputType === 'both') {
        let { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
        await writeFile(`${filename}.png`, Buffer.from(data, 'base64'));
      }
      // screenshot -> pdf
      if (outputType === 'pdf' || outputType === 'both') {
        const { data: pdf } = await Page.printToPDF();
        await writeFile(`${filename}.pdf`, Buffer.from(pdf, 'base64'));
      }
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