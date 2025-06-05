import React, { useState } from 'react';
import styles from './EvacuationDrillInfo.module.css';
import { useNavigate } from 'react-router-dom';

// 仮のデータ型定義
interface Drill {
  id: string;
  name: string;
  dateTime: string;
  location: string;
  description: string;
  targetAudience: string;
  organizer: string;
  points: number;
  mapLink?: string;
  whatToBring?: string[];
  notes?: string;
  routeBonusInfo?: string;
  registered?: boolean; // 参加登録済みか
}

const mockUpcomingDrills: Drill[] = [
  { id: 'ud001', name: '中央区総合防災訓練', dateTime: '2025/07/20 09:00', location: '中央公園', description: '地震・津波を想定した避難訓練。消火訓練、救護訓練も実施。', targetAudience: '地域住民、企業従業員', organizer: '中央区役所', points: 50, mapLink: 'https://maps.example.com/chuo-park', whatToBring: ['動きやすい服装', 'タオル', '飲み物'], notes: '小雨決行、荒天中止。', routeBonusInfo: '避難所までの新規ルート開拓で追加30ポイント！', registered: false },
  { id: 'ud002', name: 'オフィスビル火災避難訓練', dateTime: '2025/08/05 14:00', location: 'ABCタワー', description: '高層階からの避難、初期消火訓練。', targetAudience: 'ABCタワー入居テナント', organizer: 'ABCタワー管理組合', points: 30, registered: true },
];

const mockPastDrills: Drill[] = [
  { id: 'pd001', name: '春の町内会防災ウォーク', dateTime: '2025/04/15 10:00', location: '東地区公民館周辺', description: '地域の危険箇所を確認しながら避難所まで歩く訓練。', targetAudience: '町内会員', organizer: '東町内会', points: 20 },
];


const EvacuationDrillInfo: React.FC = () => {
  const [upcomingDrills, setUpcomingDrills] = useState<Drill[]>(mockUpcomingDrills);
  const [pastDrills] = useState<Drill[]>(mockPastDrills);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredUpcomingDrills = upcomingDrills.filter(drill =>
    drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drill.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRegistration = (drillId: string) => {
    setUpcomingDrills(prevDrills =>
      prevDrills.map(drill =>
        drill.id === drillId ? { ...drill, registered: !drill.registered } : drill
      )
    );
    // ここでAPI呼び出しなどを行う
    const drill = upcomingDrills.find(d => d.id === drillId);
    if (drill) {
        alert(`${drill.name} の参加を${drill.registered ? 'キャンセル' : '登録'}しました。`);
    }
  };

  const showDrillDetails = (drill: Drill) => {
    setSelectedDrill(drill);
  };

  const closeDrillDetails = () => {
    setSelectedDrill(null);
  };

  const navigate = useNavigate();

  const handleMapPage = () => {
    navigate("/training")
  }


  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>避難訓練情報</h1>
      </header>

      {/* 検索・絞り込み */}
      <div className={styles.searchFilterSection}>
        <input
          type="text"
          placeholder="訓練名、場所で検索..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {/* TODO: 絞り込みオプション (日付、対象者など) */}
      </div>

      {/* 開催予定の避難訓練一覧 */}
      <section className={styles.drillSection}>
        <h2>開催予定の避難訓練</h2>
        {filteredUpcomingDrills.length > 0 ? (
          <ul className={styles.drillList}>
            {filteredUpcomingDrills.map((drill) => (
              <li key={drill.id} className={styles.drillItem}>
                <h3>{drill.name}</h3>
                <p><strong>日時:</strong> {drill.dateTime}</p>
                <p><strong>場所:</strong> {drill.location}</p>
                <p><strong>獲得ポイント:</strong> {drill.points} P</p>
                <div className={styles.drillActions}>
                  <button onClick={() => showDrillDetails(drill)} className={styles.detailsButton}>詳細</button>
                  <button
                    onClick={() => toggleRegistration(drill.id)}
                    className={`${styles.registerButton} ${drill.registered ? styles.cancelButton : ''}`}
                  >
                    {drill.registered ? '参加キャンセル' : '参加登録'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>該当する避難訓練はありません。</p>
        )}
      </section>

      {/* 過去に参加した避難訓練の履歴 */}
      <section className={styles.drillSection}>
        <h2>過去に参加した避難訓練</h2>
        {pastDrills.length > 0 ? (
        <ul className={styles.drillList}>
          {pastDrills.map((drill) => (
            <li key={drill.id} className={`${styles.drillItem} ${styles.pastDrillItem}`}>
              <h3>{drill.name}</h3>
              <p><strong>日時:</strong> {drill.dateTime}</p>
              <p><strong>場所:</strong> {drill.location}</p>
              <p><strong>獲得ポイント:</strong> {drill.points} P</p>
              <button onClick={() => showDrillDetails(drill)} className={styles.detailsButton}>詳細</button>
            </li>
          ))}
        </ul>
        ) : (
          <p>参加履歴はありません。</p>
        )}
      </section>

      {/* 訓練詳細モーダル */}
      {selectedDrill && (
        <div className={styles.modalOverlay} onClick={closeDrillDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalButton} onClick={closeDrillDetails}>×</button>
            <h2>{selectedDrill.name}</h2>
            <p><strong>日時:</strong> {selectedDrill.dateTime}</p>
            <p><strong>場所:</strong> {selectedDrill.location}</p>
            <p><strong>内容:</strong> {selectedDrill.description}</p>
            <p><strong>対象者:</strong> {selectedDrill.targetAudience}</p>
            <p><strong>主催者:</strong> {selectedDrill.organizer}</p>
            <p><strong>獲得ポイント:</strong> {selectedDrill.points} P</p>
            {selectedDrill.mapLink && <p><strong>地図:</strong> <a onClick={handleMapPage} target="_blank" rel="noopener noreferrer">開く</a></p>}
            {selectedDrill.whatToBring && <p><strong>持ち物:</strong> {selectedDrill.whatToBring.join(', ')}</p>}
            {selectedDrill.notes && <p><strong>注意事項:</strong> {selectedDrill.notes}</p>}
            {selectedDrill.routeBonusInfo && <p><strong>ルート開拓ボーナス:</strong> {selectedDrill.routeBonusInfo}</p>}
            {!selectedDrill.registered && upcomingDrills.some(d => d.id === selectedDrill.id) && (
                <button
                    onClick={() => {
                        toggleRegistration(selectedDrill.id);
                        // 詳細モーダル内の訓練情報も更新するために、selectedDrillを更新するか、モーダルを閉じる
                        // 簡単のため、ここでは登録後にモーダルを閉じる
                        closeDrillDetails();
                    }}
                    className={styles.registerButtonModal}
                >
                    参加登録
                </button>
            )}
             {selectedDrill.registered && upcomingDrills.some(d => d.id === selectedDrill.id) && (
                <button
                    onClick={() => {
                        toggleRegistration(selectedDrill.id);
                        closeDrillDetails();
                    }}
                    className={`${styles.registerButtonModal} ${styles.cancelButtonModal}`}
                >
                    参加キャンセル
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvacuationDrillInfo;