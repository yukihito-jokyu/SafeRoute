import React from 'react';
import styles from './Points.module.css';

// 仮のデータ型定義
interface PointHistoryItem {
  id: string;
  date: string;
  reason: string;
  points: number; // 獲得は正、利用は負
}

interface RewardItem {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  category: '割引' | '防災グッズ' | '寄付' | 'その他';
}

const mockPointHistory: PointHistoryItem[] = [
  { id: 'ph001', date: '2025/05/20', reason: '避難訓練「中央区総合防災訓練」参加', points: 50 },
  { id: 'ph002', date: '2025/05/15', reason: 'ルート「自宅から避難所A」開拓ボーナス', points: 30 },
  { id: 'ph003', date: '2025/05/10', reason: '防災クイズ上級編クリア', points: 15 },
  { id: 'ph004', date: '2025/05/05', reason: '特典交換: 非常食セット', points: -80 },
];

const mockRewards: RewardItem[] = [
  { id: 'rw001', name: '地元商店街 5%割引券', pointsRequired: 50, description: '提携する地元商店街で利用可能な割引券です。', category: '割引' },
  { id: 'rw002', name: 'コンパクト防災セット', pointsRequired: 150, description: 'ライト、ホイッスル、簡易トイレなどを含む基本セット。', category: '防災グッズ' },
  { id: 'rw003', name: '非常用飲料水 (500ml x 6本)', pointsRequired: 80, description: '長期保存可能な飲料水のセット。', category: '防災グッズ' },
  { id: 'rw004', name: '地域防災活動への寄付 (100円分)', pointsRequired: 10, description: 'ポイントを地域の防災力向上のための活動に寄付します。', category: '寄付' },
];

const Points: React.FC = () => {
  const totalPoints = mockPointHistory.reduce((sum, item) => sum + item.points, 0);

  const handleExchangeReward = (reward: RewardItem) => {
    if (totalPoints >= reward.pointsRequired) {
      // TODO: ポイント交換処理 (API呼び出しなど)
      alert(`「${reward.name}」と交換しました。\n(-${reward.pointsRequired}P)`);
      // 実際には履歴を更新し、ポイントを減算する
    } else {
      alert('ポイントが不足しています。');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>ポイントシステム</h1>
      </header>

      {/* 現在の総保有ポイント */}
      <section className={`${styles.section} ${styles.totalPointsSection}`}>
        <h2>現在の総保有ポイント</h2>
        <p className={styles.totalPointsDisplay}>{totalPoints} P</p>
      </section>

      {/* ポイント獲得・利用履歴 */}
      <section className={styles.section}>
        <h2>ポイント獲得・利用履歴</h2>
        {mockPointHistory.length > 0 ? (
          <ul className={styles.historyList}>
            {mockPointHistory.map(item => (
              <li key={item.id} className={`${styles.historyItem} ${item.points > 0 ? styles.earned : styles.used}`}>
                <div className={styles.historyDetails}>
                  <span className={styles.historyDate}>{item.date}</span>
                  <span className={styles.historyReason}>{item.reason}</span>
                </div>
                <span className={styles.historyPoints}>{item.points > 0 ? `+${item.points}` : item.points} P</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>ポイントの履歴はありません。</p>
        )}
      </section>

      {/* ポイント交換可能な特典一覧 */}
      <section className={styles.section}>
        <h2>ポイント交換特典</h2>
        {mockRewards.length > 0 ? (
          <ul className={styles.rewardList}>
            {mockRewards.map(reward => (
              <li key={reward.id} className={styles.rewardItem}>
                <div className={styles.rewardInfo}>
                  <h3>{reward.name} <span className={styles.rewardCategory}>[{reward.category}]</span></h3>
                  <p className={styles.rewardDescription}>{reward.description}</p>
                  <p className={styles.rewardPointsRequired}>必要ポイント: {reward.pointsRequired} P</p>
                </div>
                <button
                  onClick={() => handleExchangeReward(reward)}
                  className={styles.exchangeButton}
                  disabled={totalPoints < reward.pointsRequired}
                >
                  交換する
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>交換可能な特典は現在ありません。</p>
        )}
      </section>
    </div>
  );
};

export default Points;