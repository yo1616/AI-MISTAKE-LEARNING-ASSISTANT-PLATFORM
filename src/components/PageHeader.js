import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PageHeader({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleHamburgerClick = () => {
    console.log('汉堡菜单点击，当前路径:', currentPath);
    // Home 页面去 Menu，其他页面回 Home
    if (currentPath === '/menu') {
      navigate('/');
    } else {
      navigate('/menu');
    }
  };

  const handleBackHomeClick = () => {
    console.log('返回 Home 按钮点击');
    navigate('/');
  };

  // 判断显示什么
  const isHomePage = currentPath === '/';
  const isMenuPage = currentPath === '/menu';

  return (
    <div className="page-header">
      <div className="header-left">
        {isHomePage && (
          // Home 页面：显示汉堡菜单（去 Menu）
          <div className="hamburger-icon" onClick={handleHamburgerClick}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {isMenuPage && (
          // Menu 页面：显示返回 Home 按钮
         <div className="back-home" onClick={handleBackHomeClick}>
        <span className="back-arrow-icon">‹</span>
        <span className="back-text">Home</span>
        </div>
        )}
        {!isHomePage && !isMenuPage && (
          // 其他页面：显示汉堡菜单（回 Home）
          <div className="hamburger-icon" onClick={handleHamburgerClick}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      <h2 className="page-title">{title}</h2>
      <div className="header-right"></div>
    </div>
  );
}

export default PageHeader;