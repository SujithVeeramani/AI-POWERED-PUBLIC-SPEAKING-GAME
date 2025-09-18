// Voice API Client for React Frontend
// utils/voiceApiClient.js

class VoiceApiClient {
  constructor(baseUrl = 'https://backend-ai-speak.onrender.com') {
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

  // ✅ Enhanced fetch with proper CORS headers
  async makeRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // ✅ Add origin header for CORS
        'Origin': window.location.origin,
        ...options.headers
      },
      // ✅ Include credentials for CORS
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, defaultOptions);
      
      // ✅ Better error handling for CORS issues
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // ✅ Enhanced error messages for CORS debugging
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Please check if the backend server is running and CORS is configured correctly');
      }
      throw error;
    }
  }

  // Upload voice recording - Updated with enhanced error handling
  async uploadVoiceRecording({
    sessionId,
    prompt,
    promptIndex,
    audioBlob,
    responseTime,
    gameSettings = {},
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
      if (wordToIntegrate !== null && wordToIntegrate !== undefined) {
        payload.word_to_integrate = wordToIntegrate;
      }
      if (wordTimestamp !== null && wordTimestamp !== undefined) {
        payload.word_timestamp = wordTimestamp;
      }
      if (audioDuration !== null && audioDuration !== undefined) {
        payload.audio_duration = audioDuration;
      }

      return await this.makeRequest('/api/voice/upload', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

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
      return await this.makeRequest(`/api/session/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify(gameResults)
      });
    } catch (error) {
      console.error('Session completion error:', error);
      throw error;
    }
  }

  // Get session data
  async getSession(sessionId) {
    try {
      return await this.makeRequest(`/api/session/${sessionId}`);
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  // List all sessions
  async listSessions() {
    try {
      return await this.makeRequest('/api/sessions');
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }

  // Health check - Updated for better CORS testing
  async healthCheck() {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

// ✅ Add connection test utility
export const testBackendConnection = async () => {
  const client = new VoiceApiClient();
  try {
    const health = await client.healthCheck();
    console.log('Backend connection successful:', health);
    return { success: true, data: health };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

// React Hook for Voice Recording - Enhanced
export const useVoiceRecorder = (apiClient) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      // ✅ More specific audio constraints for better compatibility
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
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
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
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
    throw error;
  }
};

export default VoiceApiClient;