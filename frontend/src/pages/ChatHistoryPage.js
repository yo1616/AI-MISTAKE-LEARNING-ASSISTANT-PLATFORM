import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StarButton from '../components/StarButton';
import { getChatSessions, getChatMessages, toggleConceptNoteStar } from '../data/mockApi';
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

  const handleStarToggle = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
  };

  const handleViewConcept = (concept) => {
    navigate('/concept');
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
        <PageHeader title="Chat History" />
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部</button>
          <button className={`filter-tab ${filter === 'favorited' ? 'active' : ''}`} onClick={() => setFilter('favorited')}>⭐ 已收藏</button>
        </div>
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
                      <div className="item-type">🤖 {session.title || '對話'}</div>
                      <div className="item-actions">
                        <StarButton starred={session.starred || false} onToggle={(state) => handleStarToggle(session.id, state)} />
                        <span className="history-item-time">{formatDateTime(session.updatedAt)}</span>
                      </div>
                    </div>
                    {expandedSessionId === session.id && sessionMessages[session.id] && (
                      <div className="session-messages">
                        {sessionMessages[session.id].map((msg) => (
                          <div key={msg.id} className={`session-message ${msg.role}`}>
                            <div className="message-bubble"><div className="message-text">{msg.content}</div><div className="message-time">{formatDateTime(msg.createdAt)}</div></div>
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