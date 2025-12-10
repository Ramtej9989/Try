
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

export async function uploadFile(file: File, type: string) {
  console.log("Uploading file with API key:", API_KEY);
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Add API key as query parameter
    const url = `${API_URL}/api/ingestion/upload/${type}?api_key=${API_KEY}`;
    
    console.log("Making request to:", url);
    
    // Make request with API key
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Also include as Authorization header in case backend checks there
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
  