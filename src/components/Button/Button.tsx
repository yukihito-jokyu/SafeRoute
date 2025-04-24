import React from 'react';
import './Button.css';

type ButtonProps = {
  label: string;
  icon?: React.ReactNode; // SVGなどReact要素で受け取る
  choiced?: boolean;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, icon, choiced = false, onClick }) => {
  return (
    <button
      className={`custom-button ${choiced ? 'choiced' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="icon">{icon}</span>}
      <span className="label">{label}</span>
    </button>
  );
};

