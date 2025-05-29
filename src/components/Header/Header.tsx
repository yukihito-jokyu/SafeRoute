import React from 'react';
import './Header.css';

type HeaderProps = {
  title?: string;
  onUserClick?: () => void; // マイページクリック時の動作
};

const Header: React.FC<HeaderProps> = ({ title = 'Osaka Safe Route', onUserClick }) => {
  return (
    <header className="app-header">
      <h1 className="header-title">{title}</h1>
      <img
        src="/user.svg"
        alt="マイページ"
        className="header-icon"
        onClick={onUserClick}
      />
    </header>
  );
};

export default Header;
