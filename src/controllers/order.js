'use strict';
var logger = require('../lib/logUtil');
var commonUtil = require('../lib/commonUtil');
var httpStatus = require('http-status');
var orderService= require('../services/orderService');

module.exports = function (router) {

    router.options('/*', function (req, res) {
        logger.msg('INFO', 'v1', '', '', 'OPTIONS ', 'sets the Cross-origin resource sharing (CORS) headers');
        /*sets the Cross-origin resource sharing (CORS) headers*/
        commonUtil.setCorsResponseHeaders(res)
            .then(function (res) {
                res.sendStatus(httpStatus.OK);
            });
    });



    //POST Create Order
    router.post("/", function (req, res) {
        logger.msg('INFO', 'v1', '', '', 'POST ', 'Create Order - ' + JSON.stringify(req.body));
        if(req.body.constructor === Object && (Object.keys(req.body).length === 0 )) {
            // If it is a empty body , then it is a bad request.
            logger.msg('INFO', 'v1', '', '', 'POST ', 'Contains empty body or contains more than one key ');
            commonUtil.sendResponseWoBody(res, httpStatus.BAD_REQUEST);
        } else {
            orderService.createOrder(req, res);
        }
    });

    //Get Order Status
    router.get("/:orderID", function (req, res) {
        var  orderID= req.params.orderID;
        orderService.getOrder(req, res);

    });


    //Cancel Order Status
    router.put("cancel/:orderID", function (req, res) {
        var  orderID= req.params.orderID;
        orderService.cancelOrder(req, res);

    });
};
