const {
  createMessage,
  getMessagesByConsultation,
  getConsultationById
} = require('../models/messageModel');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { consultationId, senderId, senderRole, content } = req.body;

    // Check if consultation exists
    const consultation = await getConsultationById(consultationId);
    if (!consultation) { // check if consultation exists
      return res.status(404).json({
        error: 'Consultation not found'
      });
    }

    // Verify sender is part of this consultation
    if (senderId !== consultation.patientId && senderId !== consultation.doctorId) {
      return res.status(403).json({
        error: 'You are not part of this consultation'
      });
    }

    // Test if selectedRole is the same as actualRole (patient!=doctor)
    const actualRole = senderId === consultation.patientId ? 'patient' : 'doctor';
    if (senderRole !== actualRole) {
      return res.status(400).json({
        error: `Role mismatch: you are a ${actualRole}, not a ${senderRole}`
      });
    }

    const newMessage = await createMessage(consultationId, senderId, content);
    
    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      error: 'Failed to send message'
    });
  }
};

// Get messages for a consultation
const getMessages = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { role } = req.query;

    // Validate role filter if provided
    if (role && !['patient', 'doctor'].includes(role)) {
      return res.status(400).json({
        error: 'Role must be either "patient" or "doctor"'
      });
    }

    const messages = await getMessagesByConsultation(consultationId, role);
    
    if (messages === null) {
      return res.status(404).json({
        error: 'Consultation not found'
      });
    }

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      error: 'Failed to retrieve messages'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
