const mongoose = require('mongoose');

const WebhookLogSchema = new mongoose.Schema({
  event_type: {
    type: String,
    required: true
  },
  collect_id: {
    type: String,
    index: true 
  },
  payload: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['RECEIVED', 'PROCESSED', 'FAILED'],
    default: 'RECEIVED'
  },
  response: {
    type: Object
  }
}, {
  timestamps: true
});


WebhookLogSchema.index({ collect_id: 1 });

module.exports = mongoose.model('WebhookLog', WebhookLogSchema);