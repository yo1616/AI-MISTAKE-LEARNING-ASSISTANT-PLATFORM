import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StarButton from '../components/StarButton';
import { createChatSession, addChatMessage, processAndSaveMistake } from '../data/mockApi';
import { getCurrentISOString, formatDateTime } from '../utils/timeUtils';
import { useFavorites } from '../data/FavoritesContext'; 
import '../style/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { loadFavoritedMistakes } = useFavorites();

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

  // 處理圖片選擇
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除圖片
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 發送訊息
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userQuestion = inputValue.trim() || '圖片問題';
    let sessionId = currentSessionId;
    
    // 建立新 session
    if (!sessionId) {
      const newSession = await createChatSession({
        subjectId: 'subject_bio',
        classId: 'class_hs2_bio_01',
        className: '高二生物班',
        unitId: 'unit_bio_02',
        title: userQuestion.substring(0, 50),
        inputType: selectedImage ? 'photo_text' : 'text'
      });
      sessionId = newSession.data.id;
      setCurrentSessionId(sessionId);
    }
    
    // 儲存用戶訊息
    const userMessageData = {
      sessionId,
      role: 'student',
      messageType: 'new_question',
      content: userQuestion,
      inputType: selectedImage ? 'photo_text' : 'text',
      questionImageUrl: imagePreview,
      createdAt: getCurrentISOString()
    };
    await addChatMessage(userMessageData);
    
    const userMessage = {
      id: generateId(),
      type: 'user',
      text: userQuestion,
      image: imagePreview,
      timestamp: formatDateTime(userMessageData.createdAt)
    };
    setMessages(prev => [...prev, userMessage]);
    
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    // 獲取 AI 回應
    const aiResponse = await getAIResponse(userQuestion, sessionId);
    const aiResponseText = aiResponse.text;
    
    // 儲存錯題（分類由 mockApi 內部處理）
    const mistakeResult = await processAndSaveMistake(userQuestion, aiResponseText, sessionId);
    console.log('錯題儲存結果:', mistakeResult);
    
    // 儲存 AI 訊息
    const aiMessageData = {
      sessionId,
      role: 'assistant',
      messageType: 'answer',
      content: aiResponseText,
      createdAt: getCurrentISOString()
    };
    await addChatMessage(aiMessageData);
    
    const aiMessage = {
      id: generateId(),
      type: 'ai',
      text: aiResponseText,
      isFavorited: false,
      timestamp: formatDateTime(aiMessageData.createdAt)
    };
    setMessages(prev => [...prev, aiMessage]);

    setIsLoading(false);
  };

  // 點擊星星時收藏
  const handleStarToggle = async (messageId, starred, messageData) => {
    // 從 localStorage 找到對應的錯題並更新收藏狀態
    const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
    const mistakeIndex = mistakes.findIndex(m => 
      m.studentQuestion === messageData.text || 
      m.aiSummary === messageData.text
    );
    
    if (mistakeIndex !== -1) {
      mistakes[mistakeIndex].starred = starred;
      mistakes[mistakeIndex].starredAt = starred ? new Date().toISOString() : null;
      localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isFavorited: starred } : msg
      ));
      
      await loadFavoritedMistakes();
    }
    
    console.log(`對話 ${messageId} 收藏狀態: ${starred}`);
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
                      <StarButton 
                        starred={msg.isFavorited || false} 
                        onToggle={(state) => handleStarToggle(msg.id, state, msg)}
                      />
                    </div>
                  )}
                  {msg.type === 'user' && msg.image && (
                    <div className="message-image">
                      <img src={msg.image} alt="用戶上傳" />
                    </div>
                  )}
                  <div className="message-text">{msg.text}</div>
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
              <label className="plus-button" style={{ cursor: 'pointer' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4V20M20 12H4" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </label>
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="預覽" className="image-preview" />
                  <button className="remove-image-btn" onClick={removeImage}>✕</button>
                </div>
              )}
              
              <div className="search-container">
                <input 
                  ref={inputRef} 
                  type="text" 
                  className="search-input" 
                  placeholder="輸入你的問題或上傳圖片..."
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyPress={handleKeyPress} 
                />
                <button 
                  className="send-button" 
                  onClick={handleSendMessage} 
                  disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                >
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