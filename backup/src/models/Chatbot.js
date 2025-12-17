const mongoose = require('mongoose');

const chatbotResponseSchema = new mongoose.Schema(
  {
    keywords: {
      type: [String],
      required: [true, 'Keywords harus diisi'],
      lowercase: true
    },
    response: {
      type: String,
      required: [true, 'Response harus diisi']
    },
    kategori: {
      type: String,
      enum: ['pengajuan', 'absensi', 'cuti', 'umum', 'teknis'],
      default: 'umum'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatbotResponse', chatbotResponseSchema);
