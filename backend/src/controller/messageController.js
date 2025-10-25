const { createMessage, getMessagesByConsultation, getConsultationById } = require('../models/messageModel');

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { consultationId, authorId, authorRole, content } = req.body;
    
    // Verify consultation exists
    const consultation = await getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found'
      });
    }
    
    const newMessage = await createMessage(consultationId, authorId, authorRole, content);
    
    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: newMessage
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message'
    });
  }
};

// Get messages for a consultation
const getMessages = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { author_role } = req.query;
    
    // Verify consultation exists
    const consultation = await getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found'
      });
    }
    
    const messages = await getMessagesByConsultation(consultationId, author_role);
    
    res.json({
      status: 'success',
      data: {
        consultation: {
          id: consultation.id,
          patient_id: consultation.patient_id,
          doctor_id: consultation.doctor_id,
          status: consultation.status
        },
        messages: messages,
        count: messages.length
      }
    });
    
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({
      error: 'Failed to retrieve messages'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages
};