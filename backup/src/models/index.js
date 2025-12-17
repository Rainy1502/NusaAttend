/**
 * Models Index
 * Export semua models dalam satu file untuk kemudahan import
 */

const User = require('./User');
const Pengajuan = require('./Pengajuan');
const Absensi = require('./Absensi');
const ChatbotResponse = require('./Chatbot');

module.exports = {
  User,
  Pengajuan,
  Absensi,
  ChatbotResponse
};
