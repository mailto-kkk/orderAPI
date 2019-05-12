'use strict';

var mysql = require('mysql');
var logger = require('./logUtil');
var util = require('util');

var dbUtil = function () {
    var pool = null;
    return {
        config: function (conf) {
            logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'config', 'Pool configuration');
            pool = mysql.createPool(conf);
        },
        getConnection: function (callback) {
            var timingStart = new Date();
            logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'getConnection', 'MySQL getConnection START >> ' + timingStart);
            //logger.trace('***** using pool: ' + util.inspect(pool));
            if (pool) {
                pool.getConnection(
                    function (err, dbConn) {
                        var timingEnd = new Date();

                        var timingDifference = timingEnd.getTime() - timingStart.getTime();
                        logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'getConnection', 'MySQL getConnection END >> ' + timingEnd);
                        logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'getConnection', 'MySQL getConnection END, Elapsed time in ms >> ' + timingDifference);
                        callback(err, dbConn);
                    }
                );
            } else {
                logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'getConnection', 'DB Pool not found.  Make sure dbUtil is configured properly.');
                var err = new Error('alert.error.internalError');
                if (callback) {
                    callback(err);
                } else {
                    throw err;
                }
            }
        },
        releaseConnection: function (connection) {
            logger.msg('INFO', 'index(Main)', '', 'dbUtil', 'releaseConnection', 'releaseConnection');
            if (connection) {
                connection.release();
            }
        }
    };
};

module.exports = dbUtil();
