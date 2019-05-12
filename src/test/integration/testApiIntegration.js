/*global describe:false, it:false, before:false, after:false*/

'use strict';

var kraken = require('kraken-js'),
    express = require('express'),
    expect = require('chai').expect,
    httpStatus = require('http-status'),
    supertest = require('supertest');

var os = require('os');
var _ = require('lodash');

// This gets the ip of the server that will execute this integration test
/*
 var ip = _.chain(os.networkInterfaces())
 .values()
 .flatten()
 .filter(function (val) {
 return (val.family === 'IPv4' && val.internal === false);
 })
 .pluck('address')
 .first()
 .value();
 */

var ip = '127.0.0.1';
var api = supertest('http://' + ip + ':8001');

describe('Order API', function () {

    describe('Store the order Detail through /order endpoint', function () {

        it('should return HTTP status 201 (Created) ', function (done) {
            var request = {
			  "userName": "value3",
			  "amount": 100
			};

            api.post('/order')
                .set('Content-type', 'application/json')
                .set('Authorization', 'Basic T0NUZXN0aW5nOlByb3RlY3QkMQ==')
                .send(request)
                .end(function (err, res) {
                    expect(httpStatus.CREATED).to.equal(res.statusCode);
                    done(err);
                });
        });

        

    });
	
	
    describe('Get the order Detail through /Order/{order ID} endpoint', function () {
        it('should return HTTP status 200 with the order Detail value ', function (done) {
            var request = {
			};

            api.get('/order/11')
                .set('Content-type', 'application/json')
                .set('Authorization', 'Basic T0NUZXN0aW5nOlByb3RlY3QkMQ==')
                .send(request)
                .end(function (err, res) {
                    expect(httpStatus.OK).to.equal(res.statusCode);
                    done(err);
                });
        });       

    });
	
	
	describe('Get the order Detail through /order/{order ID} endpoint', function () {
        it('should return HTTP status 404(if the order Detail is not there in DB) ', function (done) {
            var request = {
			};

            api.get('/order/22222222')
                .set('Content-type', 'application/json')
                .set('Authorization', 'Basic T0NUZXN0aW5nOlByb3RlY3QkMQ==')
                .send(request)
                .end(function (err, res) {
                    expect(httpStatus.NOT_FOUND).to.equal(res.statusCode);
                    done(err);
                });
        });       

    });
});
