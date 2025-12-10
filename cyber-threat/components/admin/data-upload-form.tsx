'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your-secret-key-for-api-auth';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const initialUploadState: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  success: false
};

export default function DataUploadForm() {
  // State for file uploads
  const [assets, setAssets] = useState<File | null>(null);
  const [threatIntel, setThreatIntel] = useState<File | null>(null);
  const [authLogs, setAuthLogs] = useState<File | null>(null);
  const [networkLogs, setNetworkLogs] = useState<File | null>(null);

  // State for upload progress
  const [assetsState, setAssetsState] = useState<UploadState>({...initialUploadState});
  const [threatIntelState, setThreatIntelState] = useState<UploadState>({...initialUploadState});
  const [authLogsState, setAuthLogsState] = useState<UploadState>({...initialUploadState});
  const [networkLogsState, setNetworkLogsState] = useState<UploadState>({...initialUploadState});
  
  // Summary of uploads
  const [uploadSummary, setUploadSummary] = useState<{[key: string]: number}>({});
  
  // Running detection state
  const [detectionState, setDetectionState] = useState({
    isRunning: false,
    completed: false,
    error: null as string | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const uploadFile = async (
    file: File | null,
    endpoint: string, 
    stateSetter: React.Dispatch<React.SetStateAction<UploadState>>
  ): Promise<number | null> => {
    if (!file) {
      stateSetter({...initialUploadState, error: 'No file selected'});
      return null;
    }

    stateSetter({...initialUploadState, isUploading: true});

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ingestion/upload/${endpoint}?api_key=${API_KEY}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              stateSetter(prev => ({...prev, progress: percentCompleted}));
            }
          }
        }
      );

      stateSetter({...initialUploadState, success: true});
      return response.data.count || 0;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Upload failed';
      stateSetter({...initialUploadState, error: errorMsg});
      return null;
    }
  };

  const runDetection = async () => {
    setDetectionState({ isRunning: true, completed: false, error: null });
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/detection/run?api_key=${API_KEY}`
      );
      
      setDetectionState({ isRunning: false, completed: true, error: null });
    } catch (error: any) {
      setDetectionState({
        isRunning: false,
        completed: false,
        error: error.response?.data?.detail || 'Failed to run detection'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset summary
    setUploadSummary({});

    // Upload files in parallel
    const results = await Promise.all([
      uploadFile(assets, 'assets', setAssetsState),
      uploadFile(threatIntel, 'threat_intel', setThreatIntelState),
      uploadFile(authLogs, 'auth_logs', setAuthLogsState),
      uploadFile(networkLogs, 'network_logs', setNetworkLogsState)
    ]);

    // Summarize results
    const summary: {[key: string]: number} = {};
    if (results[0] !== null) summary.assets = results[0];
    if (results[1] !== null) summary.threatIntel = results[1];
    if (results[2] !== null) summary.authLogs = results[2];
    if (results[3] !== null) summary.networkLogs = results[3];

    setUploadSummary(summary);
  };

  const renderUploadStatus = (state: UploadState) => {
    if (state.isUploading) {
      return (
        <div className="ml-2">
          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>
      );
    }

    if (state.success) {
      return <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>;
    }

    if (state.error) {
      return <span className="ml-2 text-sm text-red-500">{state.error}</span>;
    }

    return null;
  };

  const anyUploading = assetsState.isUploading || threatIntelState.isUploading || 
    authLogsState.isUploading || networkLogsState.isUploading;

  const allSuccessful = assetsState.success && threatIntelState.success && 
    authLogsState.success && networkLogsState.success;
    
  return (
    <div className="bg-white
