import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

type HeaderProps = {
  title?: string;
  onUserClick?: () => void; // マイページクリック時の動作
};

const Header: React.FC<HeaderProps> = ({ title = 'Osaka Safe Route', onUserClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // 外側クリック時にメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick();
    } else {
      setShowUserMenu(!showUserMenu);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  return (
    <header className="app-header">
      <h1 className="header-title">{title}</h1>
      <div className="header-user-menu" ref={menuRef}>
        <img
          src="/user.svg"
          alt="マイページ"
          className="header-icon"
          onClick={handleUserClick}
        />
        {showUserMenu && (
          <div className="user-dropdown">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <div className="user-actions">
              <button onClick={handleSettings} className="dropdown-button">設定</button>
              <button onClick={handleLogout} className="dropdown-button logout">ログアウト</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
