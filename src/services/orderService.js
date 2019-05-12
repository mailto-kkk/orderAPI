'use strict';

var logger = require('../lib/logUtil');
var commonUtil = require('../lib/commonUtil');
var httpStatus = require('http-status');
var orderModel = require('../models/orderModel');

function orderService() {
}

module.exports = orderService;

/*
    Used to store the order details
 */
orderService.createOrder = function(request,response) {

    var userName=request.body.userName;
    var amount=request.body.amount;
     return orderModel.insertOrder(userName,amount)
        .then(function(insertedData){
            if(insertedData){
                return commonUtil.sendResponse(response, httpStatus.CREATED, insertedData);
            } else {
                logger.msg('ERROR', 'orderService', '', '', 'createOrder', 'Undefined error in createOrder - ' + err.stack);
                return commonUtil.sendResponseWoBody(response, httpStatus.INTERNAL_SERVER_ERROR);
            }
        }, function (err) {
            logger.msg('ERROR', 'orderService', '', '', 'createOrder', 'Undefined error in createOrder - ' + err.stack);
            return commonUtil.sendResponseWoBody(response, httpStatus.INTERNAL_SERVER_ERROR);
        });
};

/*
    Used to get the status for the given order ID
 */
orderService.getOrder = function(request,response) {
    var  orderID= request.params.orderID;
    return orderModel.getOrder(orderID)
        .then(function(data){
            if(data[0]){
                return commonUtil.sendResponse(response, httpStatus.OK, data[0]);
            }else{
                // If data is not there, check the DB with only 'Key'. If 'data' is not there, put as 404.
                return commonUtil.sendResponseWoBody(response, httpStatus.NOT_FOUND);
            }

        }, function (err) {
            logger.msg('ERROR', 'orderService', '', '', 'getKey', 'Undefined error in getKey - ' + err.stack);
            return commonUtil.sendResponseWoBody(response, httpStatus.INTERNAL_SERVER_ERROR);
        });
};

/*
 Used to cancel the order details
 */
orderService.cancelOrder = function(request,response) {

    var  orderID= req.params.orderID;
    var cancelReason=req.body.cancelReason;
    return orderModel.cancelOrder(orderID,cancelReason)
        .then(function(insertedData){
            if(insertedData){
                return commonUtil.sendResponse(response, httpStatus.CREATED, insertedData);
            } else {
                logger.msg('ERROR', 'orderService', '', '', 'createOrder', 'Undefined error in createOrder - ' + err.stack);
                return commonUtil.sendResponseWoBody(response, httpStatus.INTERNAL_SERVER_ERROR);
            }
        }, function (err) {
            logger.msg('ERROR', 'orderService', '', '', 'createOrder', 'Undefined error in createOrder - ' + err.stack);
            return commonUtil.sendResponseWoBody(response, httpStatus.INTERNAL_SERVER_ERROR);
        });
};