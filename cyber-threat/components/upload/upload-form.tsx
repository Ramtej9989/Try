'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { API_URL, API_KEY } from '@/lib/api-config';

interface UploadFormProps {
  title: string;
  description: string;
  type: string;
  onSuccess?: () => void;
}

export default function UploadForm({ title, description, type, onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Uploading to: ${API_URL}/api/ingestion/upload/${type}?api_key=${API_KEY}`);

      // Make the request
      const response = await fetch(`${API_URL}/api/ingestion/upload/${type}?api_key=${API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type header for multipart/form-data
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully uploaded ${data.records_processed || 0} records`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <Button
          type="submit"
          disabled={uploading || !file}
          isLoading={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  );
}
