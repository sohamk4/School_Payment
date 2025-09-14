const OrderStatus = require('../models/OrderStatus');
const Order=require('../models/Orderr');
const { generateSignature } = require('../middleware/auth');
const axios = require('axios');
require('dotenv').config();
const{validateOrder,validateCollectRequest,validateGetAllTransactions,validateGetschools,validateGetid,validateGetstas,handleValidationErrors}=require('../utils/Validates');


exports.createPayment = [validateOrder,handleValidationErrors,async (req, res) => {
  try {
    const { school_id, instituteName, trustee_id, student_info, amount, callback_url, gateway_name='Razorpay' } = req.body;

    const order = new Order({
      school_id,
      instituteName,
      trustee_id,
      student_info,
      gateway_name
    });
    await order.save();
    
    const orderStatus = new OrderStatus({
      collect_id: order._id,
      order_amount: amount,
      status: 'created'
    });

    await orderStatus.save();

    const jwtPayload = {
      school_id: school_id.toString(),
      amount: amount.toString(),
      callback_url
    };
    
    const sign = generateSignature(jwtPayload);

    const paymentRequest = {
      school_id: school_id.toString(),
      amount: amount.toString(),
      callback_url,
      sign
    };

    const response = await axios.post(
      'https://dev-vanilla.edviron.com/erp/create-collect-request',
      paymentRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      }
    );

    orderStatus.customer_id = response.data.collect_request_id;
    await orderStatus.save();

    res.json({
      success: true,
      payment_url: response.data.Collect_request_url,
      order_id: order._id,
      collect_request_id: response.data.collect_request_id
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create order'
    });
  }
}];

exports.createCollectRequest = [validateCollectRequest,handleValidationErrors,async (req, res) => {
  try {
    const { collect_request_id } = req.params;
    const { school_id } = req.query;


    const jwtPayload = {
      school_id: school_id.toString(),
      collect_request_id
    };
    
    const sign = generateSignature(jwtPayload);

    const response = await axios.get(
      `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}`,
      {
        params: {
          school_id: school_id.toString(),
          sign
        },
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      }
    );

    const orderStatus = await OrderStatus.findOne({ customer_id: collect_request_id });
    if (orderStatus) {
      orderStatus.status = response.data.status;
      if (response.data.amount) orderStatus.transaction_amount = response.data.amount;
      if (response.data.status === 'SUCCESS') orderStatus.payment_time = new Date();
      await orderStatus.save();
    }

    res.json({
      success: true,
      status: response.data.status,
      amount: response.data.amount,
      details: response.data.details
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create order'
    });
  }
}];


// Get all transactions
exports.getAllTransactions = [validateGetAllTransactions,handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      id,       
      sort = 'createdAt', 
      order = 'dsc',
      day,
      status,
      institute_name,
      gateway,
      start_date, 
      end_date,
    } = req.query;
  
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const allowedSortFields = [
      'createdAt', 'payment_time', 'order_amount', 'transaction_amount', 
      'status', 'custom_order_id', 'school_id', 'gateway', 'bank_name',
      'payment_mode', 'student_name'
    ];
    
    const sortField = sort ;
    
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    const pipeline = [];
    const matchStage = {};
    
    if (gateway) {
      matchStage.gateway_name = gateway;
    }
    if (institute_name) {
      matchStage['instituteName'] = new RegExp(institute_name, 'i');
    }
    
    const dateFilter = {};
    if (day === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter.$gte = startOfDay;
    } else if (day === 'yesterday') {
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      
      const endOfYesterday = new Date();
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      
      dateFilter.$gte = startOfYesterday;
      dateFilter.$lte = endOfYesterday;
    } else if (day === 'thisweek') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter.$gte = startOfWeek;
    } else if (day === 'thismonth') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      dateFilter.$gte = startOfMonth;
    } else if (start_date || end_date) {
      if (start_date) {
        const startDate = new Date(start_date);
        startDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }
    }
    
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
        
    pipeline.push({
      $lookup: {
        from: 'orderstatuses',
        localField: '_id',
        foreignField: 'collect_id',
        as: 'info'
      }
    });
    
    pipeline.push({
      $unwind: {
        path: '$info',
        preserveNullAndEmptyArrays: true
      }
    });
    
    const postLookupMatch = {};    
    if (id) {
      postLookupMatch['info.customer_id'] = id;
    }
    
    if (status) {
      postLookupMatch['info.status'] = status;
    }
    if (Object.keys(postLookupMatch).length > 0) {
      pipeline.push({ $match: postLookupMatch });
    }
    
    pipeline.push({
      $project: {
        collect_id: '$_id',
        school_id: 1,
        gateway: '$gateway_name',
        order_amount: '$info.order_amount',
        transaction_amount: '$info.transaction_amount',
        status: '$info.status',
        custom_order_id: '$info.customer_id',
        bank_name: '$info.bank_reference',
        payment_mode: '$info.payment_mode',
        payment_message: '$info.payment_message',
        payment_time: '$info.payment_time',
        student_info: 1,
        createdAt: 1,
        instituteName: { $ifNull: ['$instituteName', ''] }
      }
    });
    
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await Order.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(total / limitNum);    
    pipeline.push({$sort: { [sortField]: sortOrder,_id: sortOrder}});
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const transactions = await Order.aggregate(pipeline);

    if (id && transactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found with the given custom_order_id'
      });
    }

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  };
}];


//Transaction by School ID
exports.getTransactions = [validateGetschools,handleValidationErrors, async (req, res) => {
  try {

    const { schoolId } = req.params;
    const transactions = await Order.aggregate([
      {
        $match: {
          school_id: schoolId
        }
      },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          instituteName:1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: '$status_info.customer_id',
          bank_name:'$status_info.bank_reference',
          payment_mode:'$status_info.payment_mode',
          payment_message:'$status_info.payment_message',
          student_info: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  };
}];


// Get transaction status by custom_order_id ID
exports.getTransactionCustomer = [validateGetid,handleValidationErrors,async (req, res) => {
  try {
    const { custom_order_id } = req.params;
    
    const transaction = await OrderStatus.aggregate([
      {
        $match: {
          customer_id: custom_order_id
        }
      },
      {
        $lookup: {
          from: 'orders', 
          localField: 'collect_id',
          foreignField: '_id',
          as: 'order_info'
        }
      },
      {
        $unwind: {
          path: '$order_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          bank_name: '$bank_reference',
          status: 1,
          order_amount: 1,
          transaction_amount: 1,
          payment_mode: 1,
          payment_message: 1,
          payment_time: 1,
          error_message: 1,
          school_id: '$order_info.school_id',
          gateway: '$order_info.gateway_name',
          institute_name:'$order_info.instituteName',
          student_info: '$order_info.student_info',
          createdAt: 1
        }
      }
    ]);

    if (transaction.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found with the given custom_order_id'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction[0] 
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  };
}];

//getstatsbyschoolid
exports.getTransactionStats = [validateGetstas,handleValidationErrors, async (req, res) => {
  try {
    const { school_id, date_from, date_to } = req.query;

    const matchConditions = {};
    
    if (school_id) {
      matchConditions.school_id = school_id;
    }

    if (date_from || date_to) {
      matchConditions['order_status.payment_time'] = {};
      if (date_from) {
        matchConditions['order_status.payment_time'].$gte = new Date(date_from);
      }
      if (date_to) {
        matchConditions['order_status.payment_time'].$lte = new Date(date_to);
      }
    }

    const stats = await Order.aggregate([
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'order_status'
        }
      },
      {
        $unwind: {
          path: '$order_status',
          preserveNullAndEmptyArrays: false 
        }
      },
      {
        $match: {
          'order_status.status': { $exists: true, $ne: null },
          'order_status.transaction_amount': { $exists: true, $ne: null },
          ...matchConditions
        }
      },
      {
        $group: {
          _id: null,
          total_transactions: { $sum: 1 },
          total_amount: { $sum: '$order_status.transaction_amount' },
          successful_transactions: {
            $sum: { $cond: [{ $eq: ['$order_status.status', 'success'] }, 1, 0] }
          },
          failed_transactions: {
            $sum: { $cond: [{ $eq: ['$order_status.status', 'failed'] }, 1, 0] }
          },
          pending_transactions: {
            $sum: { $cond: [{ $eq: ['$order_status.status', 'pending'] }, 1, 0] }
          },
          successful_amount: {
            $sum: {
              $cond: [
                { $eq: ['$order_status.status', 'success'] },
                '$order_status.transaction_amount',
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total_transactions: 0,
      total_amount: 0,
      successful_transactions: 0,
      failed_transactions: 0,
      pending_transactions: 0,
      successful_amount: 0
    };

    result.success_rate = result.total_transactions > 0 
      ? ((result.successful_transactions / result.total_transactions) * 100).toFixed(2) 
      : '0.00';

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  };
}];

exports.getallnames = async (req, res) => {
  try {
      const names = await Order.find({}, { 'instituteName': 1 });

      const studentNames = names.map(order => ({
        id: order._id,
        name: order.instituteName
      }))

      res.status(200).json({
          success: true,
          count: studentNames.length,
          data: studentNames
      });
  } catch (error) {
      console.error('Error fetching student names:', error);
      res.status(500).json({
          success: false,
          message: 'Server Error'
      });
  }
};