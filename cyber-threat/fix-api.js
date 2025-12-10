// fix-api.js
const fs = require('fs');

// Path to the file that handles API calls
const apiFilePath = './components/upload/upload-handler.ts';

// Check if file exists
if (!fs.existsSync(apiFilePath)) {
  console.log("Creating API handler file...");
  
  // Create the directories if they don't exist
  fs.mkdirSync('./components/upload', { recursive: true });
  
  // Create the file with the correct implementation
  const apiContent = `
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
    const url = \`\${API_URL}/api/ingestion/upload/\${type}?api_key=\${API_KEY}\`;
    
    console.log("Making request to:", url);
    
    // Make request with API key
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Also include as Authorization header in case backend checks there
          'Authorization': \`Bearer \${API_KEY}\`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
  `;
  
  fs.writeFileSync(apiFilePath, apiContent);
  console.log(`Created ${apiFilePath} with the correct API key handling`);
} else {
  console.log("Updating existing API handler file...");
  
  // Update the existing file
  const updatedContent = `
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
    const url = \`\${API_URL}/api/ingestion/upload/\${type}?api_key=\${API_KEY}\`;
    
    console.log("Making request to:", url);
    
    // Make request with API key
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Also include as Authorization header in case backend checks there
          'Authorization': \`Bearer \${API_KEY}\`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
  `;
  
  fs.writeFileSync(apiFilePath, updatedContent);
  console.log(`Updated ${apiFilePath} with the correct API key handling`);
}

// Now update your Upload page to use the handler
const uploadPagePath = './app/upload/page.tsx';

if (fs.existsSync(uploadPagePath)) {
  console.log("Updating Upload page to use the fixed API handler...");
  
  const currentContent = fs.readFileSync(uploadPagePath, 'utf8');
  
  // Only update if needed
  if (!currentContent.includes('import { uploadFile } from')) {
    const updatedContent = currentContent.replace(
      "import axios from 'axios';",
      "import { uploadFile } from '@/components/upload/upload-handler';"
    ).replace(
      /const response = await axios\.post\([^;]+;/gs,
      "const response = await uploadFile(file, type);"
    );
    
    fs.writeFileSync(uploadPagePath, updatedContent);
    console.log(`Updated ${uploadPagePath} to use the fixed API handler`);
  } else {
    console.log("Upload page already using the handler, no changes needed.");
  }
} else {
  console.log("Upload page not found, skipping update.");
}

console.log("\nDone! Now restart your Next.js server and try uploading the files again.");
