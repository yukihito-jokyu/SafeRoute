import React from 'react';
import './Button.css';

type ButtonProps = {
  label: string;
  iconName: string; // ファイル名だけ受け取る（例: "Home.png"）
  choiced?: boolean;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, iconName, choiced = false, onClick }) => {
  const iconSrc = `/${iconName}`; // publicフォルダ内の画像に対応

  return (
    <button
      className={`custom-button ${choiced ? 'choiced' : ''}`}
      onClick={onClick}
    >
      <img src={iconSrc} alt={label} className="icon" />
    </button>
  );
};
