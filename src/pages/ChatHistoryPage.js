import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getStudentChatSessions, getChatMessages, deleteChatSession } from '../services/api';
import { formatDateTime } from '../utils/timeUtils';
import '../style/ChatHistoryPage.css';

function ChatHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionMessages, setSessionMessages] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getStudentChatSessions();
      console.log('對話列表:', data);
      
      // 標準化資料格式（確保有 id 欄位）
      const normalizedSessions = data.map(session => ({
        id: session.sessionId || session.id,
        title: session.title,
        updatedAt: session.updatedAt,
        starred: session.starred || false,
        ...session
      }));
      
      setSessions(normalizedSessions);
    } catch (error) {
      console.error('載入對話失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId) => {
    if (sessionMessages[sessionId]) return;
    try {
      const data = await getChatMessages(sessionId);
      console.log(`對話 ${sessionId} 訊息:`, data);
      
      // 標準化訊息格式
      const normalizedMessages = data.map(msg => ({
        id: msg.messageId || msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        ...msg
      }));
      
      setSessionMessages(prev => ({ ...prev, [sessionId]: normalizedMessages }));
    } catch (error) {
      console.error('載入訊息失敗:', error);
    }
  };

  const handleSessionClick = async (sessionId) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
      await loadMessages(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除這個對話紀錄嗎？')) {
      try {
        await deleteChatSession(sessionId);
        await loadSessions();
        if (expandedSessionId === sessionId) {
          setExpandedSessionId(null);
          setSessionMessages(prev => {
            const newState = { ...prev };
            delete newState[sessionId];
            return newState;
          });
        }
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗');
      }
    }
  };

  const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.starred);

  const groupByDate = (sessionsList) => {
    const groups = {};
    sessionsList.forEach(session => {
      if (session.updatedAt) {
        const date = new Date(session.updatedAt).toLocaleDateString('zh-TW');
        if (!groups[date]) groups[date] = [];
        groups[date].push(session);
      }
    });
    return groups;
  };

  const groupedSessions = groupByDate(filteredSessions);

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="chat-history-page">
      <div className="chat-history-container">
        <PageHeader title="對話紀錄" />
        

        <div className="history-list">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">💬</div>
              <div className="empty-text">暫無對話記錄</div>
              <div className="empty-hint">在 Home 頁面提問，對話會自動保存</div>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([date, daySessions]) => (
              <div key={date} className="date-group">
                <div className="date-header">{date}</div>
                {daySessions.map((session) => (
                  <div key={session.id} className={`history-item ${expandedSessionId === session.id ? 'expanded' : ''}`}>
                    <div className="history-item-header" onClick={() => handleSessionClick(session.id)}>
                      <div className="item-type">{session.title || '對話'}</div>
                      <div className="item-actions">
                        <span className="history-item-time">{formatDateTime(session.updatedAt)}</span>
                        <button 
                          className="delete-session-btn"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          aria-label="刪除對話"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {expandedSessionId === session.id && sessionMessages[session.id] && (
                      <div className="session-messages">
                        {sessionMessages[session.id].map((msg) => (
                          <div key={msg.id} className={`session-message ${msg.role}`}>
                            <div className="message-bubble">
                              <div className="message-text">{msg.content}</div>
                            </div>
                            <div className="message-time">{formatDateTime(msg.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryPage;