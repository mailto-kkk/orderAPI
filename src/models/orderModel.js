'use strict';

function orderModel() {
    return {};
}

module.exports = orderModel;

var moment=require('moment');
var Q = require('q');
var logger = require('../lib/logUtil');
var commonUtil = require('../lib/commonUtil');
var DBUtil = require('../lib/dbUtil');
var Client = require('node-rest-client').Client;
var constants = require('../lib/constants');

orderModel.insertOrder = function (userName,postingAmount) {
    logger.msg('INFO', 'orderModel', '', '', 'insertOrder', 'insertOrder');
    var d              = Q.defer();
    //var currentTimestamp=moment().unix();
    var currentTimestamp=moment.utc().unix();
    var orderID=uuid.v4();
    var sqlData        = [orderID,userName,constants.CREATED,postingAmount,currentTimestamp];
    var tableMainQuery   = "INSERT INTO ORDER(ORDER_ID,USER_NAME,STATE,AMOUNT,CREATED_TIME_UTC) VALUES(?,?,?,?,?)";
    DBUtil.getConnection(function (err, dbConn) {
        if (err) {
            logger.msg('ERROR', 'orderModel', '', '', 'insertOrder', 'Error during getConnection :: err - ' + err.stack);
            d.reject(err);
        } else {
            dbConn.query(tableMainQuery, sqlData, function (err, results) {

                if (err) {
                    logger.msg('ERROR', 'orderModel', '', '', 'insertOrder', 'Error during executing SQL :: err - ' + err.stack);
                    DBUtil.releaseConnection(dbConn);
                    d.reject(err);
                } else {
                    var responseToSend={
                        "orderID":orderID
                    };
                    // Call the payment API. If it is success, update as 'Confirmed'
                    postPayment(orderID,userName,postingAmount,function (status,postingID){
                        if(status){
                            // success. Update DB as 'Confirmed'
                            var state=constants.CONFIRMED;
                        }else{
                            // Failed. Update DB as 'CANCELLED'
                            var state=constants.CANCELLED;
                        }
                        var updateQuery="UPDATE ORDER SET STATE = ? , POSTING_ID = ? WHERE ORDER_ID = ? ";
                        var sqlData        = [state,postingID,orderID];
                        dbConn.query(tableMainQuery, sqlData, function (err, results){
                            DBUtil.releaseConnection(dbConn);
                            if (err) {
                                logger.msg('ERROR', 'orderModel', '', '', 'insertOrder', 'Error during getConnection :: err - ' + err.stack);
                                d.reject(err);
                            }
                            else{
                                d.resolve(responseToSend);
                            }
                        });
                    });

                }
            });
        }
    });
    return d.promise;
};

function postPayment(orderID,userName,postingAmount,callback) {
    logger.msg('INFO', 'postPayment', '', '', 'postPayment', 'Within postPayment');
    var client = new Client();

    var args = {
        data: {
            "orderID": orderID,
            "userName": userName,
            "postingAmount": postingAmount
        },
        headers: {
            "Content-Type": constants.CON_TYPE,
            "Authorization": constants.AUTHORIZATION
        }
    };

    client.post(constants.PAYMENT_URL, args, function (data, response) {
        logger.msg('INFO', 'postPayment', '', '', 'postPayment', 'Payment Module Response Status:' + response.statusCode);
        if (response.statusCode == '200') {
            callback(true,data.postingID);
        } else {
            logger.msg('ERROR', 'postPayment', '', '', 'postPayment', 'Error -- Payment Module Response Status:' + response.statusCode);
            callback(false);
        }
    }).on('error', function (err) {
        callback(false);
    });
}
;

orderModel.getOrder = function (orderID) {
    logger.msg('INFO', 'orderModel', '', '', 'getOrder', 'getOrder');
    var d              = Q.defer();

    var sqlData        = [orderID];
    var tableMainQuery   = "SELECT STATE FROM ORDER WHERE ORDER_ID=? ";
    
    logger.msg('INFO', 'orderModel', '', '', 'getOrder', 'tableMainQuery is '+tableMainQuery);
    DBUtil.getConnection(function (err, dbConn) {
        if (err) {
            logger.msg('ERROR', 'orderModel', '', '', 'getOrder', 'Error during getConnection :: err - ' + err.stack);
            d.reject(err);
        } else {
            dbConn.query(tableMainQuery, sqlData, function (err, results) {
                DBUtil.releaseConnection(dbConn);
                if (err) {
                    logger.msg('ERROR', 'orderModel', '', '', 'getOrder', 'Error during executing SQL :: err - ' + err.stack);
                    d.reject(err);
                } else {
                    d.resolve(results);
                }
            });
        }
    });
    return d.promise;
};

orderModel.cancelOrder = function (orderID,cancelReason) {
    logger.msg('INFO', 'orderModel', '', '', 'cancelOrder', 'cancelOrder');
    var d              = Q.defer();
    var postingID;
    var sqlData        = ["CANCELLED",cancelReason,orderID];
    var tableMainQuery   = "UPDATE ORDER SET STATE = ?, REASON = ? WHERE ORDER_ID = ?";
    DBUtil.getConnection(function (err, dbConn) {
        if (err) {
            logger.msg('ERROR', 'orderModel', '', '', 'cancelOrder', 'Error during getConnection :: err - ' + err.stack);
            d.reject(err);
        } else {
            dbConn.query(tableMainQuery, sqlData, function (err, results) {
                DBUtil.releaseConnection(dbConn);
                if (err) {
                    logger.msg('ERROR', 'orderModel', '', '', 'cancelOrder', 'Error during executing SQL :: err - ' + err.stack);
                    d.reject(err);
                } else {
                    var responseToSend={
                        "orderID":orderID
                    };
                    // Get the postingID from the 'GET' operation
                    cancelPayment(postingID,cancelReason,function (status){
                        if(status){
                            d.resolve(responseToSend);
                        }else{
                            // Payment module is throwing some error
                            d.reject(err);
                        }
                    });

                }
            });
        }
    });
    return d.promise;
};

function cancelPayment(postingID,cancelReason,callback) {
    logger.msg('INFO', 'cancelPayment', '', '', 'cancelPayment', 'Within postPayment');
    var client = new Client();

    var args = {
        data: {
            "cancelReason": cancelReason
        },
        headers: {
            "Content-Type": constants.CON_TYPE,
            "Authorization": constants.AUTHORIZATION
        }
    };

    client.post(constants.PAYMENT_CANCEL_URL+postingID, args, function (data, response) {
        logger.msg('INFO', 'cancelPayment', '', '', 'cancelPayment', 'Payment Module Response Status:' + response.statusCode);
        if (response.statusCode == '200') {
            callback(true);
        } else {
            logger.msg('ERROR', 'cancelPayment', '', '', 'cancelPayment', 'Error -- Payment Module Response Status:' + response.statusCode);
            callback(false);
        }
    }).on('error', function (err) {
        callback(false);
    });
};

function updateOrderState(){
    var d              = Q.defer();
    var postingID;
    var sqlData        = [constants.DELIVERED,constants.CONFIRMED];
    var tableMainQuery   = "UPDATE ORDER SET STATE = ? WHERE STATE = ? ";
    DBUtil.getConnection(function (err, dbConn) {
            dbConn.query(tableMainQuery, sqlData, function (err, results) {
                DBUtil.releaseConnection(dbConn);
                 return true;
            });
    });
}
