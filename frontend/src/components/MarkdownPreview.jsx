import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownPreview({ content, fileName }) {
  const [viewRaw, setViewRaw] = useState(false);

  const handleDownload = useCallback(() => {
    if (!content) return;

    // Create Blob with proper Markdown MIME type
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    
    // Create temporary anchor element
    const tempLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Sanitize filename from original implementation
    const safeFilename = fileName
      ? fileName.replace(/[^a-z0-9]/gi, '_') + '.md'
      : `converted-${Date.now()}.md`;

    tempLink.href = url;
    tempLink.setAttribute('download', safeFilename);
    tempLink.style.display = 'none';
    
    document.body.appendChild(tempLink);
    tempLink.click();
    
    // Cleanup
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  }, [content, fileName]);

  return (
    <div className="preview-container">
      <div className="header-controls">
        <div className="view-toggle">
          {/* Existing view toggle buttons */}
        </div>
        
        <button 
          className="download-button"
          onClick={handleDownload}
          disabled={!content}
        >
          ↓ Download MD
        </button>
      </div>

      {viewRaw ? (
        <pre className="raw-content">{content}</pre>
      ) : (
        <ReactMarkdown className="markdown-content">
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
}