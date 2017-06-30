const chai = require('chai');
const should = chai.should();
const Hapi = require('hapi');
const request = require('supertest')
const api = require('../dist/api');
const querystring = require('querystring');
const server = api.server;


describe('Test API', function () {
  function binaryParser(res, callback) {
    res.setEncoding('base64');
    res.data = '';
    res.on('data', function (chunk) {
      res.data += chunk;
    });
    res.on('end', function () {
      callback(null, res.data);
    });
  }

  // POST
  describe('Calling POST /screenshots/actions/capture for a PNG', function () {
    it('for a valid URL should return 200 OK with an image/png data stream', function (done) {
      request(server.listener)
        .post('/screenshots/actions/capture')
        .send({ url: 'https://en.wikipedia.org/wiki/Software_bug' })
        .expect(200)
        .expect('Content-Type', /png/)
        .buffer()
        .parse(binaryParser)
        .end(function (err, res) {
          if (err) done(err);
          else {
            res.body.should.be.ok;
            done();
          }
        });
    });
    it('for a valid URL and a THUMBNAIL request should return 200 OK with an image/png data stream', function (done) {
      request(server.listener)
        .post('/screenshots/actions/capture')
        .send({ url: 'https://www.vodafone.com', thumbnail: {width: 320, height: 200 } })
        .expect(200)
        .expect('Content-Type', /png/)
        .buffer()
        .parse(binaryParser)
        .end(function (err, res) {
          if (err) done(err);
          else {
            res.body.should.be.ok;
            done();
          }
        });
    });
    it.skip('for a not valid URL should return an error', function (done) {
      request(server.listener)
        .post('/screenshots/actions/capture')
        .send({ url: 'https://en.vvc.en.vvc' })
        .expect(500)
        .end(function (err, res) {
          if (err) done(err);
          else {            
            done();
          }
        });      
    });  

    it('for a valid URL should return 200 OK with an application/pdf data stream', function (done) {
      request(server.listener)
        .post('/screenshots/actions/capture')
        .send({ url: 'https://en.wikipedia.org/wiki/Software_bug', type: 'pdf' })
        .expect(200)
        .expect('Content-Type', /pdf/)
        .buffer()
        .parse(binaryParser)
        .end(function (err, res) {
          if (err) done(err);
          else {
            res.body.should.be.ok;
            done();
          }
        });
    });
    it.skip('for a not valid URL should return an error', function (done) {
      request(server.listener)
        .post('/screenshots/actions/capture')
        .send({ url: 'https://en.vvc.en.vvc', type: 'pdf' })
        .expect(500)
        .end(function (err, res) {
          if (err) done(err);
          else {            
            done();
          }
        });      
    });  
    });

  // GET  
  describe('Calling GET /screenshots/{url}', function () {
    it('for a valid URL should return 200 OK with an image/png data stream', function (done) {
      const url = `/screenshots/${querystring.escape('https://en.wikipedia.org/wiki/Software_bug')}`;
      request(server.listener)
        .get(url)
        .expect(200)
        .expect('Content-Type', /png/)
        .buffer()
        .parse(binaryParser)
        .end(function (err, res) {
          if (err) done(err);
          else {
            res.body.should.be.ok;
            done();
          }
        });
    });
    it('for a valid URL request should return 200 OK with an image/png data stream', function (done) {
      const url = 'https://www.vodafone.com';
      request(server.listener)
        .get(`/screenshots/${querystring.escape(url)}?thumbnail=160,100`)
        .expect(200)
        .expect('Content-Type', /png/)
        .buffer()
        .parse(binaryParser)
        .end(function (err, res) {
          if (err) done(err);
          else {
            res.body.should.be.ok;
            done();
          }
        });
    });
    it.skip('for a not valid URL should return an error', function (done) {
      const url = 'https://en.vvc.en.vvc';
      request(server.listener)
        .get(`/screenshots/${encodeURI(url)}?thumbnail=160,100`)
        .expect(500)
        .end(function (err, res) {
          if (err) done(err);
          else {            
            done();
          }
        });      
    });    
  }); 
  after('close server', async function () {
      return await api.stop();
  });
});





