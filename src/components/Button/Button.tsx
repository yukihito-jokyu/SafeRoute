import React from 'react';
import './Button.css';

type ButtonProps = {
  label: string;
  iconName: string; // 例: "home.svg"
  choiced?: boolean;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, iconName, choiced = false, onClick }) => {
  const iconSrc = `/${iconName}`; // public フォルダ直下の画像参照

  return (
    <button
      className={`custom-button ${choiced ? 'choiced' : ''}`}
      onClick={onClick}
    >
      <img src={iconSrc} alt={label} className="icon" />
      <span className="label">{label}</span> {/* ← ラベル表示を追加 */}
    </button>
  );
};
