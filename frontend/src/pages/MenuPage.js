import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getCurrentStudent } from '../data/mockApi';

function MenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState('');

  // 根据当前路径设置选中项
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelectedItem('home');
    } else if (path === '/important-mistake') {
      setSelectedItem('important-mistake');
    } else if (path === '/important-concept') {
      setSelectedItem('important-concept');
    } else if (path === '/chapters') {
      setSelectedItem('mistake-notebook');
    } else if (path === '/concept') {
      setSelectedItem('concept');
    } else if (path === '/chat-history') {
      setSelectedItem('chat-history');
    } else if (path === '/diagnostic-quiz') {
      setSelectedItem('diagnostic-quiz');
    } else if (path === '/dashboard') {
      setSelectedItem('dashboard');
    } else if (path === '/account') {
      setSelectedItem('account');
    }
  }, [location.pathname]);

  const menuItems = [
    { id: 'important-mistake', label: 'Important Mistake Notebook', section: 'favorites', path: '/important-mistake' },
    { id: 'important-concept', label: 'Important Concept', section: 'favorites', path: '/important-concept' },
    { id: 'mistake-notebook', label: 'Mistake Notebook', section: 'studytools', path: '/chapters' },
    { id: 'concept', label: 'Concept', section: 'studytools', path: '/concept' },
    { id: 'chat-history', label: 'Chat History', section: 'studytools', path: '/chat-history' },
    { id: 'diagnostic-quiz', label: 'Diagnostic Quiz', section: 'studytools', path: '/diagnostic-quiz' },
    { id: 'dashboard', label: 'Dashboard', section: 'studytools', path: '/dashboard' },
    { id: 'account', label: 'Account', section: 'studytools', path: '/account' }
  ];

  const favorites = menuItems.filter(item => item.section === 'favorites');
  const studyTools = menuItems.filter(item => item.section === 'studytools');

  const handleItemClick = (id, path) => {
    setSelectedItem(id);
    // 延遲 0.3 秒後跳轉（讓動畫有時間顯示）
    setTimeout(() => {
      if (path) {
        navigate(path);
      }
    }, 300);
  };

  return (
    <div className="menu">
      <PageHeader title="Menu" />
      
      <div className="favorites-section">
        <div className="section-header">Favorites</div>
        {favorites.map(item => (
          <div
            key={item.id}
            className={`menu-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => handleItemClick(item.id, item.path)}
          >
            <span className="item-label">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="studytools-section">
        <div className="section-header">Study Tools</div>
        {studyTools.map(item => (
          <div
            key={item.id}
            className={`menu-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => handleItemClick(item.id, item.path)}
          >
            <span className="item-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;