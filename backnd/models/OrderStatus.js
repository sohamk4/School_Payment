const mongoose = require('mongoose');

const OrderStatus = new mongoose.Schema({
    collect_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    order_amount: {
        type: Number,
        required: true,
        min: 0,
        set: v => typeof v === 'string' ? parseFloat(v) : v
    },
    status: {
        type: String,
        required: true,
        default: 'NONE',
        trim:true
    },
    transaction_amount: {
        type: Number,
        min: 0,
        set: v => typeof v === 'string' ? parseFloat(v) : v
    },
    payment_mode: {
        type: String,
        trim: true,
    },
    payment_details: {
        type: String,
        trim: true
    },
    bank_reference: {
        type: String,
        trim: true
    },
    customer_id: {
        type: String,
        trim: true
    },
    payment_message: {
        type: String,
        trim: true
    },
    error_message: {
        type: String,
        trim: true
    },
    payment_time: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

OrderStatus.index({ collect_id: 1 });
OrderStatus.index({ status: 1 });
OrderStatus.index({ customer_id: 1 });
OrderStatus.index({ payment_time: -1 });
OrderStatus.index({ gateway_transaction_id: 1 });


OrderStatus.index({ collect_id: 1, status: 1 });
OrderStatus.index({ payment_time: 1, status: 1 });


OrderStatus.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed' && !this.payment_time) {
        this.payment_time = new Date();
    }
    next();
});


OrderStatus.methods.isSuccessful = function() {
    return this.status === 'completed';
};


OrderStatus.methods.getPaymentSummary = function() {
    return {
        transaction_id: this._id,
        order_id: this.collect_id,
        amount: this.transaction_amount,
        payment_mode: this.payment_mode,
        status: this.status,
        payment_time: this.payment_time,
        bank_reference: this.bank_reference
    };
};

OrderStatus.statics.findSuccessfulPayments = function(orderId) {
    return this.find({ 
        collect_id: orderId, 
        status: 'completed' 
    }).sort({ payment_time: -1 });
};

module.exports = mongoose.model('OrderStatus', OrderStatus);