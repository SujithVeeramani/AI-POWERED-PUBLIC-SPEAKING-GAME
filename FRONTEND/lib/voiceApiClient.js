// Voice API Client for React Frontend
// utils/voiceApiClient.js

class VoiceApiClient {
  constructor(baseUrl = 'http://localhost:5005') {
    this.baseUrl = baseUrl;
  }

  // Generate a unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert MediaRecorder blob to base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Upload voice recording
 async uploadVoiceRecording({
  sessionId,
  prompt,
  promptIndex,
  audioBlob,
  responseTime,
  gameSettings = {},
  // Additional parameters for Triple Step game
  wordToIntegrate,
  wordTimestamp,
  audioDuration,
}) {

    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine audio format from blob type
      const audioFormat = this.getAudioFormat(audioBlob.type);
      
      const payload = {
        session_id: sessionId,
        prompt: prompt,
        prompt_index: promptIndex,
        audio_data: base64Audio,
        audio_format: audioFormat,
        timestamp: new Date().toISOString(),
        response_time: responseTime,
        game_settings: gameSettings
      };

      // Add Triple Step specific data if provided
      if (wordToIntegrate !== null) {
        payload.word_to_integrate = wordToIntegrate;
      }
      if (wordTimestamp !== null) {
        payload.word_timestamp = wordTimestamp;
      }
      if (audioDuration !== null) {
        payload.audio_duration = audioDuration;
      }

      const response = await fetch(`${this.baseUrl}/api/voice/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Voice upload error:', error);
      throw error;
    }
  }

  // Get audio format from MIME type
  getAudioFormat(mimeType) {
    const formatMap = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg'
    };
    
    return formatMap[mimeType] || 'webm';
  }

  // Complete a game session
  async completeSession(sessionId, gameResults) {
    try {
      const response = await fetch(`${this.baseUrl}/api/session/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameResults)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Session completion failed');
      }

      return result;
    } catch (error) {
      console.error('Session completion error:', error);
      throw error;
    }
  }

  // Get session data
  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/session/${sessionId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get session');
      }

      return result;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  // List all sessions
  async listSessions() {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to list sessions');
      }

      return result;
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

// React Hook for Voice Recording
export const useVoiceRecorder = (apiClient) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
          setIsRecording(false);
          setMediaRecorder(null);
          setAudioChunks([]);
        };
        
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      } else {
        resolve(null);
      }
    });
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

// Helper function for uploading voice with word integration data
export const uploadVoiceForTripleStep = async ({
  apiClient,
  sessionId,
  prompt,
  promptIndex,
  audioBlob,
  responseTime,
  gameSettings,
  wordToIntegrate,
  wordTimestamp,
  audioDuration
}) => {
  try {
    const result = await apiClient.uploadVoiceRecording({
      sessionId,
      prompt,
      promptIndex,
      audioBlob,
      responseTime,
      gameSettings,
      wordToIntegrate,
      wordTimestamp,
      audioDuration
    });
    
    console.log('Triple Step voice uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to upload Triple Step voice:', error);
    // You might want to queue for retry or show user feedback
    throw error;
  }
};

// Example usage function for analogy game
export const uploadVoiceForPrompt = async ({
  apiClient,
  sessionId,
  prompt,
  promptIndex,
  audioBlob,
  responseTime,
  gameSettings
}) => {
  try {
    const result = await apiClient.uploadVoiceRecording({
      sessionId,
      prompt,
      promptIndex,
      audioBlob,
      responseTime,
      gameSettings
    });
    
    console.log('Voice uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to upload voice:', error);
    // You might want to queue for retry or show user feedback
    throw error;
  }
};

export default VoiceApiClient;