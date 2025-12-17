/**
 * Chatbot Controller
 * Handle chatbot interaction dan AI responses
 */

const ChatbotResponse = require('../models/Chatbot');

const chatbotController = {
  /**
   * Process user question dan return response
   */
  async ask(req, res) {
    try {
      const { question } = req.body;

      if (!question || question.trim().length === 0) {
        return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong' });
      }

      // Normalize question untuk matching
      const normalizedQuestion = question.toLowerCase().trim();

      // Cari matching response berdasarkan keywords
      const response = await chatbotController.findBestResponse(normalizedQuestion);

      res.json({
        success: true,
        question,
        response: response || 'Maaf, saya belum memahami pertanyaan Anda. Silakan hubungi admin untuk bantuan lebih lanjut.'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Find best response based on keywords
   */
  async findBestResponse(question) {
    try {
      // Get semua responses
      const responses = await ChatbotResponse.find();

      // Scoring system untuk matching
      let bestMatch = null;
      let bestScore = 0;

      for (const resp of responses) {
        let score = 0;

        // Check if keywords match
        for (const keyword of resp.keywords) {
          if (question.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = resp.response;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('Error finding response:', error);
      return null;
    }
  },

  /**
   * Get all chatbot responses (admin only)
   */
  async getAllResponses(req, res) {
    try {
      const responses = await ChatbotResponse.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        data: responses
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create new chatbot response (admin only)
   */
  async createResponse(req, res) {
    try {
      const { keywords, response, kategori } = req.body;

      if (!keywords || !response) {
        return res.status(400).json({ error: 'Keywords dan response harus diisi' });
      }

      const newResponse = new ChatbotResponse({
        keywords: Array.isArray(keywords) ? keywords : [keywords],
        response,
        kategori: kategori || 'umum'
      });

      await newResponse.save();

      res.status(201).json({
        success: true,
        message: 'Response berhasil ditambahkan',
        data: newResponse
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update chatbot response (admin only)
   */
  async updateResponse(req, res) {
    try {
      const { keywords, response, kategori } = req.body;

      const updated = await ChatbotResponse.findByIdAndUpdate(
        req.params.id,
        {
          keywords: Array.isArray(keywords) ? keywords : [keywords],
          response,
          kategori: kategori || 'umum'
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Response berhasil diupdate',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Delete chatbot response (admin only)
   */
  async deleteResponse(req, res) {
    try {
      await ChatbotResponse.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Response berhasil dihapus'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatbotController;
