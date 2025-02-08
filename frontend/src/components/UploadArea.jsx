import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { api } from '../services/api';

export default function UploadArea({ onConvert, onError }) {
  const [llmEnabled, setLlmEnabled] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');

  const validateFile = (file) => {
    const validTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Only PDF files are supported');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'application/pdf': ['.pdf']},
    multiple: false,
    onDrop: async files => {
      if (files.length > 0) {
        try {
          // Step 1: Validate the file before upload
          validateFile(files[0]);

          // Step 2: Only proceed if validation passes
          const response = await api.convertFile(
            files[0], 
            llmEnabled,
            openaiKey
          );
          
          onConvert(response.data.result, files[0].name);
        } catch (error) {
          // Step 3: Handle validation errors and API errors
          const errorMessage = error.message || 'Upload failed';
          onError(errorMessage);
        }
      }
    }
  });

  return (
    <div className="upload-section">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the PDF here</p>
        ) : (
          <p>Drag & drop PDF, or click to select</p>
        )}
      </div>

      <div className="settings">
        <label>
          <input 
            type="checkbox" 
            checked={llmEnabled}
            onChange={(e) => setLlmEnabled(e.target.checked)}
          />
          Use AI Formatting
        </label>

        <input
          type="password"
          placeholder="OpenAI Key (optional)"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
        />
      </div>
    </div>
  );
}