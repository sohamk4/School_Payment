const mongoose = require('mongoose');

const Order = new mongoose.Schema({
    school_id: {
        type: String,
        ref: 'School',
        required: true
    },
    instituteName:{
        type: String,
        ref: 'Insti',
        required: true
    },
    trustee_id: {
        type: String,
        ref: 'Trustee',
        required: true
    },
    student_info: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        id: {
            type: String,
            required: true
        },
        phone_no: {
            type: String,
            required: true,
        }
    },
    gateway_name: {
        type: String,
    }
}, {
    timestamps: true
});


Order.index({ school_id: 1, createdAt: -1 });
Order.index({ trustee_id: 1 });
Order.index({ 'student_info.id': 1 });
Order.index({ createdAt: 1 });

Order.virtual('student_email').get(function() {
    return this.student_info.email;
});

Order.methods.getOrderInfo = function() {
    return {
        order_id: this._id,
        school_id: this.school_id,
        student_name: this.student_info.name,
        amount: this.order_amount,
        created_at: this.createdAt
    };
};

module.exports = mongoose.model('Order', Order);