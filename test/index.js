const HandsFreeChrome = require('../dist/index.js');

let chrome = new HandsFreeChrome();
chrome.captureScreenshot('https://en.wikipedia.org/wiki/Node.js')
  .then(name => console.log(`Files written: ${name}.png and ${name}.pdf`))
  .catch(err => console.log(err));
//chrome.captureScreenshot('https://error.www.www.it/');