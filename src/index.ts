import * as fs from 'fs';
import * as url from 'url';
import * as util from 'util';
import { Readable } from 'stream';
import * as md5 from 'md5';
import * as sharp from 'sharp';
const debug = require('debug')('HFC:Main');
const lighthouse = require('lighthouse');
const chrome = require('chrome-remote-interface');
const { Launcher } = require('lighthouse/chrome-launcher/chrome-launcher');
import {ScreenMetrics, DesktopScreenMetrics, BasicScreenMetrics} from './screens';

const writeFile = util.promisify(fs.writeFile);

process.on('unhandledRejection', (reason, p) => {
  debug('Unhandled Rejection at:', p, 'REASON:', reason);
});

export interface Options {
  port: number,
  autoSelectChrome: boolean,
  chromeFlags: string[],
  chromePath?: string
};
export type OutType = 'png' | 'pdf';
export type ExtOutType = OutType | 'both';
export type Thumbnail = {width: number, height: number};

export class HandsfreeChrome {
  launcher: any = null;
  protocol: any = null;
  options: Options;

  constructor(opts: Options = { port: 9222, autoSelectChrome: true, chromeFlags: ['--disable-gpu', '--headless'] }) {
    this.options = opts;
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
   * @param {Object} metrics - screen metrics configuration for the screenshot 
   * @param {Object} thumbnail - optional, an Object with width, height properties (in pixels). If specified, resizes the png image to width x height size.
   * @returns {Promise} - resolved to filename string, in case of success.
   */
  async captureScreenshot(url: string, outputType: ExtOutType = 'png', metrics: ScreenMetrics = DesktopScreenMetrics, thumbnail?: Thumbnail): Promise<string> {
    const filename = md5(url);    
    try {
      // screenshot -> png
      if (outputType === 'png' || outputType === 'both') {
        const writeStream = fs.createWriteStream(`${filename}.png`, { encoding: 'base64' });
        const pngReadStream = await this.captureScreenshotAsStream(url, 'png', metrics);
        if(thumbnail) {
          const resizer = sharp();
          resizer.resize(thumbnail.width, thumbnail.height).png();
          pngReadStream.pipe(resizer).pipe(writeStream);
        }
        else pngReadStream.pipe(writeStream);                
      }
      // screenshot -> pdf
      if (outputType === 'pdf' || outputType === 'both') {
        const writeStream = fs.createWriteStream(`${filename}.pdf`, { encoding: 'base64' });
        (await this.captureScreenshotAsStream(url, 'pdf', metrics)).pipe(writeStream);
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
   * @param {Object} metrics - screen metrics configuration for the screenshot 
   * @returns {Promise} - resolved to the screenshot data Stream, in case of success.
   */
  async captureScreenshotAsStream(url: string, outputType: OutType = 'png', metrics: ScreenMetrics = DesktopScreenMetrics): Promise<Readable> {
    const stream: Readable = new Readable();
    try {
      if (!this.launcher.chrome) await this.launchChrome();
      if (!this.protocol) {
        this.protocol = await chrome({ port: this.options.port || 9222 });
        await Promise.all([
          this.protocol.Page.enable()
        ]);
      }
      const { Page, Emulation } = this.protocol;

      await Page.navigate({ url: url });
      await Page.loadEventFired();
      await Promise.all([
        Emulation.setDeviceMetricsOverride(metrics),
        Emulation.setVisibleSize({ width: metrics.width, height: metrics.height }),  
        Emulation.forceViewport({ x: 0, y: 0, scale: 1 }),
      ]);
    
      // screenshot -> png
      if (outputType === 'png') {
        let { data } = await Page.captureScreenshot({ format: 'png', fromSurface: true });
        stream.push(data/*.split(';base64,').pop()*/, 'base64');
        stream.push(null);
      }
      // screenshot -> pdf
      else if (outputType === 'pdf') {
        const { data: pdf } = await Page.printToPDF();
        stream.push(pdf/*.split(';base64,').pop()*/, 'base64');
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
  async close() {
    if (this.protocol) await this.protocol.close();
    if (this.launcher) await this.launcher.kill();
    this.protocol = null;
    this.launcher = null;
    return true;
  }
}

