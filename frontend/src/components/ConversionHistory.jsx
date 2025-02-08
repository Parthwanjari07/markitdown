import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ConversionHistory({ onSelect, refreshTrigger }) {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const response = await api.getConversions();
        setConversions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        const handledError = api.handleError(error);
        console.error(`History load failed: ${handledError.message}`);
        setConversions([]);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [refreshTrigger]);

  return (
    <div className="history-sidebar">
      <h3>Conversion History</h3>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="conversion-list">
          {conversions.map(conv => (
            <div 
              key={conv.id}
              className="conversion-item"
              onClick={() => onSelect(conv.id)}
            >
              <div className="title">{conv.title}</div>
              <div className="date">
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}