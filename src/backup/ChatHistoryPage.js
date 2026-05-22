import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getChatSessions, getChatMessages, deleteChatSession } from '../services/api';  // 新增 deleteChatSession

import { formatDateTime } from '../utils/timeUtils';
import '../style/ChatHistoryPage.css';

function ChatHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionMessages, setSessionMessages] = useState({});
  const [filter, setFilter] = useState('all');
  

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const result = await getChatSessions();
    if (result.success) setSessions(result.data);
  };

  const loadMessages = async (sessionId) => {
    if (sessionMessages[sessionId]) return;
    const result = await getChatMessages(sessionId);
    if (result.success) {
      setSessionMessages(prev => ({ ...prev, [sessionId]: result.data }));
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

  // 新增：刪除對話
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();  // 防止觸發展開/收合
    if (window.confirm('確定要刪除這個對話紀錄嗎？')) {
      const result = await deleteChatSession(sessionId);
      if (result.success) {
        // 重新載入列表
        await loadSessions();
        // 如果刪除的是目前展開的對話，清空展開狀態
        if (expandedSessionId === sessionId) {
          setExpandedSessionId(null);
          setSessionMessages(prev => {
            const newState = { ...prev };
            delete newState[sessionId];
            return newState;
          });
        }
      }
    }
  };


  const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.starred);

  const groupByDate = (sessionsList) => {
    const groups = {};
    sessionsList.forEach(session => {
      const date = new Date(session.updatedAt).toLocaleDateString('zh-TW');
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    });
    return groups;
  };

  const groupedSessions = groupByDate(filteredSessions);

  return (
    <div className="chat-history-page">
      <div className="chat-history-container">
        <PageHeader title="對話紀錄" />
        <div className="history-list">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="empty-history"><div className="empty-icon">💬</div><div className="empty-text">暫無對話記錄</div><div className="empty-hint">在 Home 頁面提問，對話會自動保存</div></div>
          ) : (
            Object.entries(groupedSessions).map(([date, daySessions]) => (
              <div key={date} className="date-group">
                <div className="date-header">{date}</div>
                {daySessions.map((session) => (
                  <div key={session.id} className={`history-item ${expandedSessionId === session.id ? 'expanded' : ''}`}>
                    <div className="history-item-header" onClick={() => handleSessionClick(session.id)}>
                      <div className="item-type"> {session.title || '對話'}</div>
                       <div className="item-actions">
                        <span className="history-item-time">{formatDateTime(session.updatedAt)}</span>
                        {/* 刪除按鈕 */}
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