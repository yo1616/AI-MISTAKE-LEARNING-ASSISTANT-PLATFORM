import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

function MenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    const path = location.pathname;
    
     if (path === '/important-mistake') setSelectedItem('important-mistake');
    else if (path === '/important-concept') setSelectedItem('important-concept');
    else if (path === '/chapters') setSelectedItem('mistake-notebook');
    else if (path === '/concept') setSelectedItem('concept');
    else if (path === '/chat-history') setSelectedItem('chat-history');
    else if (path === '/diagnostic-quiz') setSelectedItem('diagnostic-quiz');
    else if (path === '/dashboard') setSelectedItem('dashboard');
    else if (path === '/account') setSelectedItem('account');
  }, [location.pathname]);

  const menuItems = [
    
    { id: 'important-mistake', label: '重要錯題列表', section: 'favorites', path: '/important-mistake' },
    { id: 'important-concept', label: '重要觀念', section: 'favorites', path: '/important-concept' },
    { id: 'mistake-notebook', label: '錯題列表', section: 'studytools', path: '/chapters' },
    { id: 'concept', label: '觀念', section: 'studytools', path: '/concept' },
    { id: 'chat-history', label: '對話紀錄', section: 'studytools', path: '/chat-history' },
    { id: 'diagnostic-quiz', label: '即時測驗', section: 'studytools', path: '/diagnostic-quiz' },
    { id: 'dashboard', label: '分析表', section: 'studytools', path: '/dashboard' },
    { id: 'account', label: '設定', section: 'studytools', path: '/account' }
  ];

  const favorites = menuItems.filter(item => item.section === 'favorites');
  const studyTools = menuItems.filter(item => item.section === 'studytools');

  const handleItemClick = (id, path) => {
    setSelectedItem(id);
    setTimeout(() => {
      if (path) navigate(path);
    }, 150);
  };

  return (
    <div className="menu">
      <PageHeader title="選單" />
      <div className="favorites-section">
        <div className="section-header">我的最愛</div>
        {favorites.map(item => (
          <div key={item.id} className={`menu-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => handleItemClick(item.id, item.path)}>
            <span className="item-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="studytools-section">
        <div className="section-header">學習工具</div>
        {studyTools.map(item => (
          <div key={item.id} className={`menu-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => handleItemClick(item.id, item.path)}>
            <span className="item-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;