import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StarButton from '../components/StarButton';
import { createChatSession, addChatMessage, getChatMessages } from '../data/mockApi';
import { getCurrentISOString, formatDateTime } from '../utils/timeUtils';
import '../style/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 6);
  };

  const getAIResponse = async (question, sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    if (question.includes('細胞分裂')) {
      response = '細胞分裂可以分為有絲分裂和減數分裂。有絲分裂包含前期、中期、後期、末期。染色體在前期會凝縮成可見的條狀結構。';
    } else if (question.includes('染色體')) {
      response = '染色體是遺傳物質 DNA 的載體，在細胞分裂過程中會凝縮成可見的條狀結構。人類有 23 對染色體。';
    } else {
      response = `好的，這裡就是這樣子。這個問題用到了「生物體的組成」單元中的「細胞構造」概念。記得細胞膜是所有細胞都有的結構，而細胞壁只有植物細胞才有。`;
    }
    
    const aiMessage = {
      sessionId,
      role: 'assistant',
      messageType: 'answer',
      content: response,
      createdAt: getCurrentISOString()
    };
    await addChatMessage(aiMessage);
    
    return {
      id: generateId(),
      type: 'ai',
      text: response,
      timestamp: formatDateTime(aiMessage.createdAt)
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userQuestion = inputValue.trim();
    let sessionId = currentSessionId;
    
    if (!sessionId) {
      const newSession = await createChatSession({
        subjectId: 'subject_bio',
        classId: 'class_hs2_bio_01',
        className: '高二生物班',
        unitId: 'unit_bio_02',
        title: userQuestion.substring(0, 50),
        inputType: 'text'
      });
      sessionId = newSession.data.id;
      setCurrentSessionId(sessionId);
    }
    
    const userMessageData = {
      sessionId,
      role: 'student',
      messageType: 'new_question',
      content: userQuestion,
      createdAt: getCurrentISOString()
    };
    await addChatMessage(userMessageData);
    
    const userMessage = {
      id: generateId(),
      type: 'user',
      text: userQuestion,
      timestamp: formatDateTime(userMessageData.createdAt)
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    const aiResponse = await getAIResponse(userQuestion, sessionId);
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleNewQuestion = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleViewConcept = (concept) => {
    navigate('/concept');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <PageHeader title="Home" />
        <div className="home-content">
          {messages.length === 0 ? (
            <div className="welcome-text">你好<br />有哪個題目需要幫忙呢？</div>
          ) : (
            <div style={{ minHeight: '20px' }}></div>
          )}
          
          <div className="messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="message-bubble">
                  {msg.type === 'ai' && (
                    <div className="message-star">
                      <StarButton starred={false} onToggle={(state) => console.log('收藏', state)} />
                    </div>
                  )}
                  <div className="message-text">{msg.text}</div>
                  {msg.relatedConcept && (
                    <div className="message-footer">
                      <span className="related-label">相關概念：</span>
                      <span className="related-concept" onClick={() => handleViewConcept(msg.relatedConcept)}>
                        {msg.relatedConcept}
                      </span>
                    </div>
                  )}
                </div>
                <div className="message-time">{msg.timestamp}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-bubble loading">
                  <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-area">
            <div className="input-wrapper">
              <button className="plus-button" onClick={handleNewQuestion}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4V20M20 12H4" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="search-container">
                <input ref={inputRef} type="text" className="search-input" placeholder="輸入你的問題..."
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} />
                <button className="send-button" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#FFFFFF" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;