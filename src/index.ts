import * as fs from 'fs';
import * as url from 'url';
import * as util from 'util';
import { Readable } from 'stream';
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

type OutType = 'png' | 'pdf';
type ExtOutType = OutType | 'both';


class HandsfreeChrome {
  launcher: any = null;
  protocol: any = null;

  constructor(opts: Options = { port: 9222, autoSelectChrome: true, chromeFlags: ['--disable-gpu', '--headless'] }) {
    this.launcher = new Launcher(opts);
  }
  /**
   * Launches Chrome, if not already started.
   */
  private async launchChrome() {
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
  async captureScreenshot(url: string, outputType: ExtOutType = 'png'): Promise<string> {
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
        const writeStream = fs.createWriteStream(`${filename}.png`, {encoding: 'base64'});
        (await this.captureScreenshotAsStream(url)).pipe(writeStream);
       
      }
      // screenshot -> pdf
      if (outputType === 'pdf' || outputType === 'both') {
        const writeStream = fs.createWriteStream(`${filename}.pdf`, {encoding: 'base64'});
        (await this.captureScreenshotAsStream(url, 'pdf')).pipe(writeStream);
      }
      debug('all done.');
      return filename;
    } catch (err) {
      debug(err);
      throw err;
    }
  };
  /**
   * Captures a screenshot of the page at specified URL.
   * It returns a Promise fulfilled with a readable stream
   * @param {string} url - complete URL of the webpage to take a screenshot
   * @param {string} outputType - image type for the data stream, can be 'png' or 'pdf' 
   * @returns {Promise} - resolved to the screenshot data Stream, in case of success.
   */
  async captureScreenshotAsStream(url: string, outputType: OutType = 'png'): Promise<Readable> {
    let Page;
    const stream: Readable = new Readable({encoding: 'base64'});
    try {
      if (!this.launcher.chrome) await this.launchChrome();
      if (!this.protocol) this.protocol = await chrome();
      Page = this.protocol.Page;
      await Page.enable();
      await Page.navigate({ url: url });
      await Page.loadEventFired();
      // screenshot -> png
      if (outputType === 'png') {
        let { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
        stream.push(data.split(';base64,').pop(), 'base64');
        stream.push(null);        
      }
      // screenshot -> pdf
      else if (outputType === 'pdf') {
        const { data: pdf } = await Page.printToPDF();
        stream.push(pdf.split(';base64,').pop(), 'base64');
        stream.push(null);        
      }
      debug('all done.');
      return stream;
    } catch (err) {
      debug(err);
      throw err;
    }
  };
  /**
   * Closes connections to Chrome and kills the launched Chrome process
   */
  private async close() {
    if (this.protocol) await this.protocol.close();
    if (this.launcher) await this.launcher.kill();
  }
}

module.exports = HandsfreeChrome;