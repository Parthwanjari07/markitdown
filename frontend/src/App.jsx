import { useState, useEffect  } from 'react';
import UploadArea from './components/UploadArea';
import ConversionHistory from './components/ConversionHistory';
import MarkdownPreview from './components/MarkdownPreview';
import { api } from './services/api';
import { checkApiConnection } from './services/networkCheck';

export default function App() {
  const [content, setContent] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    const verifyConnection = async () => {
      const isOnline = await checkApiConnection();
      setApiOnline(isOnline);
    };
    verifyConnection();
  }, []);

  // // Add to MarkdownPreview component
  // useEffect(() => {
  //   const handleKeyPress = (e) => {
  //     if ((e.ctrlKey || e.metaKey) && e.key === 's') {
  //       e.preventDefault();
  //       handleDownload();
  //     }
  //   };

  //   document.addEventListener('keydown', handleKeyPress);
  //   return () => document.removeEventListener('keydown', handleKeyPress);
  // }, [content, fileName]);



  const handleConvert = async (result, fileName) => {
    try {
      // Preserve original filename with sanitization
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '_');
      
      setContent(result);
      setCurrentTitle(cleanFileName);
      
      await api.saveConversion(cleanFileName, result);
    } catch (error) {
      setError('Failed to save conversion');
    }
  };

  const handleHistorySelect = async (id) => {
    try {
      const response = await api.getConversion(id);
      setContent(response.data.content);
      setCurrentTitle(response.data.title);
    } catch (error) {
      setError('Failed to load conversion');
    }
  };

  return (
    <div className="app-container">
      {!apiOnline && (
        <div className="connection-banner">
          ⚠️ Backend API is unreachable - check if server is running on port 8000
        </div>
      )}
      <ConversionHistory onSelect={handleHistorySelect} />

      <main className="main-content">
        <h1>PDF to Markdown Converter</h1>

        <UploadArea 
          onConvert={handleConvert}
          onError={setError}
        />

        {error && <div className="error-message">{error}</div>}

        {content && (
          <div className="preview-section">
            <div className="header">
              <h2>{currentTitle}</h2>
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
              >
                Copy Markdown
              </button>
            </div>
            
            <MarkdownPreview 
              content={content}
              fileName={currentTitle ? `${currentTitle}.md` : 'converted.md'}
            />

          </div>
        )}
      </main>
    </div>
  );
}