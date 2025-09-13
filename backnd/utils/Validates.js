const { body, param, query, validationResult } = require('express-validator');

const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }
  next();
};

const validateOrder = [
  body('school_id')
    .notEmpty()
    .withMessage('School ID is required')
    .isString()
    .withMessage('School ID must be a string'),
  
  body('instituteName')
    .notEmpty()
    .withMessage('Institute name is required')
    .isString()
    .withMessage('Institute name must be a string'),
  
  body('trustee_id')
    .notEmpty()
    .withMessage('Trustee ID is required')
    .isString()
    .withMessage('Trustee ID must be a string'),
  
  body('student_info.name')
    .notEmpty()
    .withMessage('Student name is required')
    .isString()
    .withMessage('Student name must be a string'),
  
  body('student_info.id')
    .notEmpty()
    .withMessage('Student ID is required')
    .isString()
    .withMessage('Student ID must be a string'),
  
  body('student_info.phone_no')
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be valid'),
  
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1')
    .toFloat(),
  
  body('callback_url')
    .isURL()
    .withMessage('Callback URL must be valid'),
  
  body('gateway_name')
    .optional()
    .isIn(['Razorpay', 'Stripe', 'PayPal','CashFree','Paytm'])
    .withMessage('Gateway must be one of: Razorpay, Stripe, PayPal, CashFree, Paytm')
];

const validateCollectRequest = [
    param('collect_request_id')
      .notEmpty()
      .withMessage('Collect request ID is required')
      .isString()
      .withMessage('Collect request ID must be a string')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Collect request ID must be a valid ObjectId'),
  
    query('school_id')
      .notEmpty() 
      .withMessage('School ID is required')
      .isString()
      .withMessage('School ID must be a string')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('School ID must be a valid ObjectId'),
  ]

  const validateGetAllTransactions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('id')
    .optional()
    .isString()
    .withMessage('ID must be a string'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'payment_time', 'order_amount', 'transaction_amount', 
           'status', 'custom_order_id', 'school_id', 'gateway', 'bank_name',
           'payment_mode', 'student_name'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'dsc', 'desc'])
    .withMessage('Order must be either "asc" or "dsc"/"desc"'),
  
  query('day')
    .optional()
    .isIn(['today', 'yesterday', 'thisweek', 'thismonth'])
    .withMessage('Day must be one of: today, yesterday, thisweek, thismonth'),
  
  query('status')
    .optional()
    .isIn(['success', 'failed', 'pending', 'NONE'])
    .withMessage('Status must be one of: success, failed, pending, NONE'),
  
  query('institute_name')
    .optional()
    .isString()
    .withMessage('Institute name must be a string')
    .trim()
    .escape(),
  
  query('gateway')
    .optional()
    .isString()
    .withMessage('Gateway must be a string')
    .trim()
    .escape(),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.end_date && new Date(value) > new Date(req.query.end_date)) {
        throw new Error('Start date cannot be after end date');
      }
      return true;
    }),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) < new Date(req.query.start_date)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    })
];


const validateGetschools = [
    param('schoolId')
      .notEmpty()
      .isString()
      .withMessage('ID must be a string'),
]

const validateGetid = [
  param('custom_order_id')
    .notEmpty()
    .isString()
    .withMessage('ID must be a string'),
]


const validateGetstas = [
  query('school_id')
    .notEmpty()
    .isString()
    .withMessage('School Id must be a string')
    .trim()
    .escape(),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.end_date && new Date(value) > new Date(req.query.end_date)) {
        throw new Error('Start date cannot be after end date');
      }
      return true;
    }),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) < new Date(req.query.start_date)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    })
  ]

const validateWebhookPayload = [
  body('status')
    .isInt({ min: 100, max: 599 })
    .withMessage('Status must be a valid HTTP status code')
    .toInt(),
  
  body('order_info')
    .isObject()
    .withMessage('order_info must be an object'),
  
  body('order_info.order_id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),
  
  body('order_info.order_amount')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number')
    .toFloat(),
  
  body('order_info.transaction_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Transaction amount must be a positive number')
    .toFloat(),
  
  body('order_info.gateway')
    .optional()
    .isString()
    .withMessage('Gateway must be a string')
    .trim()
    .escape(),
  
  body('order_info.bank_reference')
    .optional()
    .isString()
    .withMessage('Bank reference must be a string')
    .trim()
    .escape(),
  
  body('order_info.status')
    .isIn(['success', 'failed', 'pending', 'cancelled', 'refunded'])
    .withMessage('Status must be one of: success, failed, pending, cancelled, refunded'),
  
  body('order_info.payment_mode')
    .optional()
    .isIn(['upi', 'card', 'netbanking', 'wallet', 'cash'])
    .withMessage('Payment mode must be one of: upi, card, netbanking, wallet, cash'),
  
  body('order_info.payemnt_details') 
    .optional()
    .isString()
    .withMessage('Payment details must be a string')
    .trim()
    .escape(),
  
  body('order_info.Payment_message') 
    .optional()
    .isString()
    .withMessage('Payment message must be a string')
    .trim()
    .escape(),
  
  body('order_info.payment_time')
    .optional()
    .isISO8601()
    .withMessage('Payment time must be a valid ISO 8601 date')
    .toDate(),
  
  body('order_info.error_message')
    .optional()
    .isString()
    .withMessage('Error message must be a string')
    .trim()
    .escape()
];

module.exports = { handleValidationErrors,validateOrder,validateCollectRequest, validateGetAllTransactions,validateGetschools,validateGetid,validateGetstas ,validateWebhookPayload };