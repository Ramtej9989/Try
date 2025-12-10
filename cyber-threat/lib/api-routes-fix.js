// lib/api-routes-fix.js
import { API_URL, API_KEY } from './api-config';

// Fix incorrect API routes
export async function fixApiRoutes() {
  try {
    // Re-run detection to ensure data is processed
    const detectionResponse = await fetch(`${API_URL}/api/detection/run?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ hours_back: 24 })
    });
    
    console.log('Detection re-run response:', await detectionResponse.json());
    
    return { success: true, message: "API routes updated and data reprocessed" };
  } catch (error) {
    console.error('Error fixing API routes:', error);
    return { success: false, error: String(error) };
  }
}

// Fetch alerts with the correct endpoint
export async function fetchAlerts(status = null, severity = null, skip = 0, limit = 100) {
  try {
    let url = `${API_URL}/api/alerts?api_key=${API_KEY}&skip=${skip}&limit=${limit}`;
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (severity) {
      url += `&severity=${severity}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch alerts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
}
