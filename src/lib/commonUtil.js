'use strict';


module.exports = CommonUtil;

var logger = require('./logUtil'),
    DBUtil = require('./dbUtil'),
    nconf = require('nconf'),
    cryptUtil = require('./cryptUtil'),
    httpStatus = require('http-status');
var Q = require('q');
var constants = require('./constants');
function CommonUtil() {
};

CommonUtil.sendResponse = function (res, httpCode, renderingContent) {
    CommonUtil.constructCommonResponseHeader(res, httpCode)
        .then(function (res) { 
            res.status(httpCode);
            res.end(JSON.stringify(renderingContent, null, 2));
        });

};



CommonUtil.sendResponseWoBody = function (res, httpCode) {
    res.status(httpCode);
    res.end();

};

CommonUtil.setCorsResponseHeaders = function (res) {
    var d = Q.defer();

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'content-type, accept, authorization, from, Api-Key, Api-Version');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    d.resolve(res);
    return d.promise;
};

CommonUtil.constructCommonResponseHeader = function (res, httpCode) {
    var d = Q.defer();
    res.contentType(constants.CON_TYPE_UTF);
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.header('X-FRAME-OPTIONS', 'deny');
    res.header('Server', 'Node JS / 6.1.0');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-WebKit-CSP', 'default-src self');
    res.header('X-Content-Type-Options', 'nosniff');

    /*sets the Cross-origin resource sharing (CORS) headers*/
    CommonUtil.setCorsResponseHeaders(res)
        .then(function (res) {
            if (httpCode === httpStatus.UNAUTHORIZED) {
                res.writeHead(httpStatus.UNAUTHORIZED, {
                    'WWW-Authenticate': 'Basic realm=XLSAccountAPI'
                });
            }
            d.resolve(res);
        });

    return d.promise;
};
