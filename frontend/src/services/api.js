import axios from 'axios';



// Create a configured axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const api = {
  convertFile: async (file, llmEnabled, openaiKey) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('llm_enabled', llmEnabled.toString()); // Convert boolean to string
    
    if (openaiKey) {
      formData.append('openai_key', openaiKey);
    }

    return apiClient.post('/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Add error handling wrapper
  handleError: (error) => {
    if (error.response) {
      return {
        message: error.response.data.detail || 'Server error occurred',
        status: error.response.status
      };
    }
    return {
      message: 'Network error - check API connection',
      status: 500
    };
  },


  saveConversion: async (title, content) => {
    const formData = new FormData();
    console.log("[DEBUG] Title type:", typeof title, title);
    console.log("[DEBUG] Content type:", typeof content, content);
    formData.append('title', title ? title.toString() : '');
    formData.append('content', content ? content.toString() : '');
    
    console.log("[DEBUG] FormData entries:");
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
    
    try {
      // Adding explicit header so axios sets the boundary correctly
      const response = await apiClient.post(`/save-conversion`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("[DEBUG] saveConversion response data:", response.data);
      return response;
    } catch (error) {
      console.error("[DEBUG] Axios error in saveConversion:", error);
      throw error;
    }
  },

  getConversions: async () => {
    return apiClient.get(`/conversions`);
  },

  getConversion: async (id) => {
    return apiClient.get(`/conversions/${id}`);
  }
};