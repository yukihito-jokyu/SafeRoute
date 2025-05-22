import { useState } from 'react';
import { Button } from '../Button/Button';
import './Footer.css';

export const Footer = () => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setSelectedButton(index);
  };

  // ラベルとアイコンファイル名のペア
  const buttons = [
    { label: 'ホーム', iconName: 'Home.png' },
    { label: '備蓄品', iconName: 'Map.png' },
    { label: 'レーダー', iconName: 'Shina.png' },
    { label: '防災マップ', iconName: 'Lader.png' },
    { label: 'マイルート', iconName: 'Rute.png' }, // 必要に応じて置き換えてください
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
