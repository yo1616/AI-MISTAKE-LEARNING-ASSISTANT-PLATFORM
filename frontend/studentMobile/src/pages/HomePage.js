import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StarButton from '../components/StarButton';
import {
  createChatSession,
  addChatMessage,
  askAiQuestion,
  processAndSaveMistake,
  toggleMistakeStar,
  updateChatSessionTitle
} from '../services/api';
import { getCurrentISOString, formatDateTime } from '../utils/timeUtils';
import { useFavorites } from '../data/FavoritesContext'; 
import '../style/HomePage.css';

const DEFAULT_CHAT_TITLE = '生物提問';
const IMAGE_CHAT_TITLE = '圖片題目分析';
const IMAGE_PLACEHOLDER_TEXT = '請根據這張圖片幫我分析';
const TITLE_FROM_AI_SUFFIX = '解析';

function sanitizeChatTitle(rawText = '', { hasImage = false } = {}) {
  const normalized = String(rawText || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return hasImage ? IMAGE_CHAT_TITLE : DEFAULT_CHAT_TITLE;
  }

  if (hasImage && normalized === IMAGE_PLACEHOLDER_TEXT) {
    return IMAGE_CHAT_TITLE;
  }

  const compact = normalized.replace(/\s+/g, '');
  const hasCjk = /[\u4e00-\u9fff]/.test(normalized);
  const isOnlyAsciiWord = /^[A-Za-z0-9_.+\-]+$/.test(compact);
  const isShortNoise = compact.length <= 6;
  const looksLikeIdOrGibberish = isOnlyAsciiWord && (/\d/.test(compact) || isShortNoise);

  if (!hasCjk && (isShortNoise || looksLikeIdOrGibberish)) {
    return hasImage ? IMAGE_CHAT_TITLE : DEFAULT_CHAT_TITLE;
  }

  return normalized.slice(0, 50);
}

function isMeaningfulStudentText(text = '') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized || normalized === IMAGE_PLACEHOLDER_TEXT) {
    return false;
  }

  const compact = normalized.replace(/\s+/g, '');
  const hasCjk = /[\u4e00-\u9fff]/.test(normalized);
  const isOnlyAsciiWord = /^[A-Za-z0-9_.+\-]+$/.test(compact);

  if (!hasCjk && compact.length <= 6 && isOnlyAsciiWord) {
    return false;
  }

  if (!hasCjk && /^[A-Za-z0-9_.+\-]+$/.test(compact) && /\d/.test(compact)) {
    return false;
  }

  return true;
}

function toSentenceTitle(text = '', fallback = DEFAULT_CHAT_TITLE) {
  const normalized = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[?？!！]+$/g, '');

  if (!normalized) {
    return fallback;
  }

  const firstSegment = normalized.split(/[。！？!?；;\n]/)[0].trim();
  return (firstSegment || normalized).slice(0, 50);
}

function extractTitleFromAiMessage(text = '') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  const conceptMatch = normalized.match(/主要考\s*([^。；，,\s]+)/);
  if (conceptMatch?.[1]) {
    return `${conceptMatch[1]}${TITLE_FROM_AI_SUFFIX}`;
  }

  const invalidQuestionMatch = normalized.match(/題目「([^」]+)」並非生物學相關/);
  if (invalidQuestionMatch?.[1]) {
    return '題目內容待確認';
  }

  return '';
}

function buildConversationTitle(messages = []) {
  const studentTexts = messages
    .filter((message) => message.type === 'user')
    .map((message) => message.text)
    .filter(isMeaningfulStudentText);

  if (studentTexts.length > 0) {
    return toSentenceTitle(studentTexts[studentTexts.length - 1], DEFAULT_CHAT_TITLE);
  }

  const aiDerivedTitle = messages
    .filter((message) => message.type === 'ai')
    .map((message) => extractTitleFromAiMessage(message.text))
    .find(Boolean);

  if (aiDerivedTitle) {
    return aiDerivedTitle;
  }

  const hasImageMessage = messages.some((message) => message.type === 'user' && message.image);
  return hasImageMessage ? IMAGE_CHAT_TITLE : DEFAULT_CHAT_TITLE;
}

function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sendingRef = useRef(false);
  const currentSessionIdRef = useRef(null);
  const messagesRef = useRef([]);
  const persistedTitleRef = useRef('');
  const { loadFavoritedMistakes } = useFavorites();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      const sessionId = currentSessionIdRef.current;
      const conversationMessages = messagesRef.current;
      const nextTitle = buildConversationTitle(conversationMessages);

      if (!sessionId || !nextTitle || persistedTitleRef.current === nextTitle) {
        return;
      }

      updateChatSessionTitle(sessionId, nextTitle)
        .then(() => {
          persistedTitleRef.current = nextTitle;
        })
        .catch((error) => {
          console.error('更新對話標題失敗:', error);
        });
    };
  }, []);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 6);
  };

  const getAIResponse = async (question, questionImageUrl = '') => {
    const result = await askAiQuestion({
      questionText: question,
      subjectId: 'subject_bio',
      questionImageUrl
    });

    const answer = result.answer || {};
    const responseText = [answer.summary, answer.detailedExplanation].filter(Boolean).join('\n');

    return {
      answer,
      recommendation: result.recommendation,
      ocrText: result.recommendation?.ocrText || '',
      message: {
        id: generateId(),
        type: 'ai',
        text: responseText,
        timestamp: formatDateTime(getCurrentISOString())
      }
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
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedImage({
        file,
        previewUrl,
        dataUrl: '',
        isReady: false
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage((prev) => {
          if (!prev || prev.file !== file) {
            return prev;
          }

          return {
            ...prev,
            dataUrl: typeof reader.result === 'string' ? reader.result : '',
            isReady: true
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除圖片
  const removeImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 發送訊息
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading || sendingRef.current) return;
    if (selectedImage && !selectedImage.isReady) return;

    const hasText = Boolean(inputValue.trim());
    const hasImage = Boolean(selectedImage?.dataUrl);
    const userQuestion = hasText ? inputValue.trim() : IMAGE_PLACEHOLDER_TEXT;
    let sessionId = currentSessionId;
    const inputType = hasImage && hasText ? 'photo_text' : hasImage ? 'photo' : 'text';
    const imagePayload = selectedImage?.dataUrl || '';
    const sessionTitle = sanitizeChatTitle(userQuestion, { hasImage });

    try {
      sendingRef.current = true;
      setIsLoading(true);

      if (!sessionId) {
        const newSession = await createChatSession({
          subjectId: 'subject_bio',
          classId: 'class_hs2_bio_01',
          unitId: 'unit_bio_02',
          subUnitId: 'subunit_bio_02_02',
          title: sessionTitle,
          inputType
        });
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        persistedTitleRef.current = sessionTitle;
      }

      const userMessageData = {
        sessionId,
        role: 'student',
        messageType: 'new_question',
        content: userQuestion,
        questionText: userQuestion,
        inputType,
        questionImageUrl: imagePayload,
        createdAt: getCurrentISOString()
      };
      const savedUserMessage = await addChatMessage(userMessageData);

      const userMessage = {
        id: generateId(),
        type: 'user',
        text: userQuestion,
        image: imagePayload,
        timestamp: formatDateTime(savedUserMessage.createdAt || userMessageData.createdAt)
      };
      setMessages((prev) => [...prev, userMessage]);

      setInputValue('');
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      const aiResponse = await getAIResponse(userQuestion, imagePayload);
      const aiResponseText = aiResponse.message.text;

      const mistakeResult = await processAndSaveMistake(userQuestion, aiResponse.answer, sessionId, {
        recommendation: aiResponse.recommendation,
        ocrText: aiResponse.ocrText,
        studentAnswer: null,
        inputType,
        questionImageUrl: imagePayload
      });
      console.log('錯題儲存結果:', mistakeResult);

      const aiMessageData = {
        sessionId,
        role: 'assistant',
        messageType: 'answer',
        content: aiResponseText,
        questionGroupId: savedUserMessage.questionGroupId,
        createdAt: getCurrentISOString()
      };
      const savedAiMessage = await addChatMessage(aiMessageData);

      const aiMessage = {
        id: savedAiMessage.id || generateId(),
        type: 'ai',
        text: aiResponseText,
        mistakeId: mistakeResult?.id,
        isFavorited: false,
        timestamp: formatDateTime(savedAiMessage.createdAt || aiMessageData.createdAt)
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('發送訊息失敗:', error);
      alert(error.message || '訊息送出失敗，請稍後再試');
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  };

  // 點擊星星時收藏
  const handleStarToggle = async (messageId, starred, messageData) => {
    if (messageData.mistakeId) {
      await toggleMistakeStar(messageData.mistakeId, starred);
    }
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFavorited: starred } : msg
    ));
    await loadFavoritedMistakes();
    console.log(`對話 ${messageId} 收藏狀態: ${starred}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !sendingRef.current) handleSendMessage();
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
            <div className="welcome-text">有哪個題目需要幫忙呢？</div>
          ) : (
            <div style={{ minHeight: '20px' }}></div>
          )}
          
          <div className="messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                {msg.type === 'user' && msg.image ? (
                  <div className="message-stack">
                    <div className="message-image-standalone">
                      <img src={msg.image} alt="用戶上傳" />
                    </div>
                    {msg.text ? (
                      <div className="message-bubble">
                        <div className="message-text">{msg.text}</div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="message-bubble">
                    <div className="message-text">{msg.text}</div>
                  </div>
                )}
                
                {/* 星星移到氣泡外面，與氣泡同一層 */}
                {msg.type === 'ai' && (
                  <div className="message-star">
                    <StarButton 
                      starred={msg.isFavorited || false} 
                      onToggle={(state) => handleStarToggle(msg.id, state, msg)}
                    />
                  </div>
                )}
                
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
                  disabled={isLoading}
                  style={{ display: 'none' }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4V20M20 12H4" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </label>
              
              {selectedImage && (
                <div className="image-preview-container">
                  <img src={selectedImage.previewUrl} alt="預覽" className="image-preview" />
                  <div className="image-preview-meta">
                    <div className="image-preview-name">{selectedImage.file?.name || '已選擇圖片'}</div>
                    <div className="image-preview-status">
                      {selectedImage.isReady ? '圖片已準備完成' : '圖片處理中...'}
                    </div>
                  </div>
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
                  disabled={isLoading}
                  onKeyPress={handleKeyPress} 
                />
                <button 
                  className="send-button" 
                  onClick={handleSendMessage} 
                  disabled={(!inputValue.trim() && !selectedImage) || Boolean(selectedImage && !selectedImage.isReady) || isLoading}
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
