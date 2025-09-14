const OrderStatus = require('../models/OrderStatus');
const WebhookLog = require('../models/WebhookLog');
require('dotenv').config();
const{validateWebhookPayload,handleValidationErrors}=require('../utils/Validates');
exports.handelwebhook = [validateWebhookPayload,handleValidationErrors,async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload);
    let collectId = null;
    if (payload.order_info && payload.order_info.order_id) {
      const idParts = payload.order_info.order_id.split('/');
      collectId = idParts[0];
      console.log(collectId);
    }

    const webhookLog = new WebhookLog({
      event_type: 'payment_webhook',
      collect_id: collectId,
      payload: payload,
      status: 'RECEIVED'
    });

    await webhookLog.save();

    if (!payload || typeof payload !== 'object') {
      webhookLog.status = 'FAILED';
      webhookLog.response = { error: 'Invalid payload format' };
      await webhookLog.save();
      
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payload format' 
      });
    }

    if (payload.status === undefined || !payload.order_info || typeof payload.order_info !== 'object') {
      webhookLog.status = 'FAILED';
      webhookLog.response = { error: 'Payload missing required fields' };
      await webhookLog.save();
      
      return res.status(400).json({ 
        success: false, 
        error: 'Payload missing required fields: status or order_info' 
      });
    }

    const orderInfo = payload.order_info;
    const requiredOrderInfoFields = ['order_id', 'order_amount', 'transaction_amount', 'status'];
    const missingFields = requiredOrderInfoFields.filter(field => !(field in orderInfo));

    if (missingFields.length > 0) {
      webhookLog.status = 'FAILED';
      webhookLog.response = { error: `Missing fields: ${missingFields.join(', ')}` };
      await webhookLog.save();
      
      return res.status(400).json({ 
        success: false, 
        error: `Missing required order_info fields: ${missingFields.join(', ')}` 
      });
    }

    if (typeof orderInfo.order_id !== 'string' || !orderInfo.order_id.includes('/')) {
      webhookLog.status = 'FAILED';
      webhookLog.response = { error: 'Invalid order_id format' };
      await webhookLog.save();
      
      return res.status(400).json({ 
        success: false, 
        error: 'order_id must be in format: collect_id/transaction_id' 
      });
    }

    let orderStatus = await OrderStatus.findOne({ customer_id: collectId });

    if (!orderStatus) {
      webhookLog.status = 'FAILED';
      webhookLog.response = { error: 'Order not found' };
      await webhookLog.save();
      
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found with the given order_id' 
      });
    }

    orderStatus.order_amount = orderInfo.order_amount;
    orderStatus.transaction_amount = orderInfo.transaction_amount;
    orderStatus.payment_mode = orderInfo.payment_mode;
    orderStatus.payment_details = orderInfo.payemnt_details;
    orderStatus.bank_reference = orderInfo.bank_reference;
    orderStatus.payment_message = orderInfo.Payment_message;
    orderStatus.status = orderInfo.status;
    orderStatus.error_message = orderInfo.error_message;
    
    if (orderInfo.payment_time && orderInfo.payment_time !== 'NA') {
      orderStatus.payment_time = new Date(orderInfo.payment_time);
    }

    await orderStatus.save();

    webhookLog.status = 'PROCESSED';
    webhookLog.response = { 
      success: true, 
      message: 'Webhook processed successfully',
      orderStatusId: orderStatus._id
    };
    await webhookLog.save();

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      orderStatusId: orderStatus._id
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
  
    const webhookLog = new WebhookLog({
      event_type: 'payment_webhook',
      payload: req.body,
      status: 'FAILED',
      response: { error: error.message }
    });
    await webhookLog.save();

    res.status(500).json({
      success: false,
      error: 'Internal server error processing webhook'
    });
  }
}];

