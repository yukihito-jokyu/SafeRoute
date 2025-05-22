import { useState } from 'react';
import { Button } from '../Button/Button';
import './Footer.css';

export const Footer = () => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setSelectedButton(index);
  };

  // PNG → SVG へ変更済み
  const buttons = [
    { label: 'ホーム', iconName: 'home.svg' },
    { label: '備蓄品', iconName: 'map.svg' },
    { label: 'レーダー', iconName: 'bichi.svg' },
    { label: '防災マップ', iconName: 'reder.svg' },
    { label: 'マイルート', iconName: 'rute.svg' },
  ];

  return (
    <div className="footer">
      {buttons.map((btn, index) => (
        <Button
          key={index}
          label={btn.label}
          iconName={btn.iconName}
          choiced={selectedButton === index}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
};
