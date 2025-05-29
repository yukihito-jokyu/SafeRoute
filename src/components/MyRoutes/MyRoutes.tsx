import React, { useState } from 'react';
import styles from './MyRoutes.module.css';

// 仮のデータ型定義
interface RouteInfo {
  id: string;
  name: string;
  distance: string; // 例: "2.5 km"
  estimatedTime: string; // 例: "30分"
  safetyRating: number; // 1-5
  createdAt: string; // 例: "2025/05/10"
  isMyRoute: boolean; // 「マイルート」か
  shared: boolean; // 共有されているか
  mapPreviewUrl?: string; // 地図プレビュー画像URL (ダミー)
  userReports?: string[]; // 安全性に関するユーザー報告
}

const mockRoutes: RouteInfo[] = [
  { id: 'r001', name: '自宅から避難所Aへの最短路', distance: '1.8 km', estimatedTime: '22分', safetyRating: 4, createdAt: '2025/05/01', isMyRoute: true, shared: true, mapPreviewUrl: 'https://via.placeholder.com/300x150.png?text=Route+A+Map', userReports: ['街灯が少ない箇所あり'] },
  { id: 'r002', name: '駅前から広域避難場所への道', distance: '3.2 km', estimatedTime: '40分', safetyRating: 3, createdAt: '2025/04/20', isMyRoute: false, shared: true, mapPreviewUrl: 'https://via.placeholder.com/300x150.png?text=Route+B+Map' },
  { id: 'r003', name: '裏山を通る近道（未検証）', distance: '1.2 km', estimatedTime: '18分', safetyRating: 2, createdAt: '2025/05/15', isMyRoute: false, shared: false, userReports: ['夜間は危険', '一部未舗装路'] },
];

// 仮のルート開拓ランキングデータ
interface RankingUser {
  rank: number;
  nickname: string;
  routesOpened: number;
  totalDistance: string;
}
const mockRanking: RankingUser[] = [
    { rank: 1, nickname: 'ルートマスター', routesOpened: 15, totalDistance: '35.2 km' },
    { rank: 2, nickname: '探検家A', routesOpened: 12, totalDistance: '28.1 km' },
    { rank: 3, nickname: '防災ウォーカー', routesOpened: 10, totalDistance: '25.5 km' },
];


const MyRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteInfo[]>(mockRoutes);
  const [isRecording, setIsRecording] = useState(false);
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  // TODO: 他のルート編集用state

  const toggleMyRoute = (routeId: string) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(r => (r.id === routeId ? { ...r, isMyRoute: !r.isMyRoute } : r))
    );
  };

  const toggleShareRoute = (routeId: string) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(r => (r.id === routeId ? { ...r, shared: !r.shared } : r))
    );
  };

  const handleStartRecording = () => {
    // TODO: GPS記録開始処理
    setIsRecording(true);
    alert('GPS記録を開始しました。');
  };
  const handlePauseRecording = () => {
    // TODO: GPS記録一時停止処理
    alert('GPS記録を一時停止しました。');
  };
  const handleStopRecording = () => {
    // TODO: GPS記録終了処理
    setIsRecording(false);
    setShowNewRouteForm(true); // 記録終了後、ルート情報入力フォーム表示
    alert('GPS記録を終了しました。ルート情報を入力してください。');
  };

  const handleSaveNewRoute = () => {
      if (!newRouteName.trim()) {
          alert('ルート名を入力してください。');
          return;
      }
      // TODO: 新規ルート保存処理 (距離、時間などはGPS記録から取得)
      const newRoute: RouteInfo = {
          id: `r${Date.now()}`,
          name: newRouteName,
          distance: "取得中...", // GPSから
          estimatedTime: "計算中...", // GPSから
          safetyRating: 3, // 初期値
          createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
          isMyRoute: false,
          shared: false,
      };
      setRoutes(prevRoutes => [newRoute, ...prevRoutes]);
      setShowNewRouteForm(false);
      setNewRouteName('');
      alert(`新規ルート「${newRouteName}」を保存しました。`);
  }

  const myRegisteredRoutes = routes.filter(r => r.isMyRoute);
  const otherRoutes = routes.filter(r => !r.isMyRoute);


  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>避難ルート記録・管理</h1>
      </header>

      {/* 新規ルートGPS記録 */}
      <section className={styles.section}>
        <h2>新規ルートを開拓</h2>
        {!isRecording && !showNewRouteForm && (
          <button onClick={handleStartRecording} className={styles.recordButton}>
            ルート記録開始 (GPS)
          </button>
        )}
        {isRecording && (
          <div className={styles.recordingControls}>
            <p>ルートを記録中です...</p>
            <button onClick={handlePauseRecording} className={styles.pauseButton}>一時停止</button>
            <button onClick={handleStopRecording} className={styles.stopButton}>記録終了</button>
          </div>
        )}
        {showNewRouteForm && (
            <div className={styles.newRouteForm}>
                <h3>新規ルート情報入力</h3>
                <input
                    type="text"
                    placeholder="ルート名"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    className={styles.inputField}
                />
                {/* 他の入力項目（メモ、危険箇所報告など） */}
                <textarea placeholder="メモ、危険箇所など..." className={styles.textareaField}></textarea>
                <button onClick={handleSaveNewRoute} className={styles.saveButton}>このルートを保存</button>
                <button onClick={() => setShowNewRouteForm(false)} className={styles.cancelButton}>キャンセル</button>
            </div>
        )}
      </section>

      {/* 登録済み「マイルート」一覧 */}
      <section className={styles.section}>
        <h2>登録済み「マイルート」 ({myRegisteredRoutes.length})</h2>
        {myRegisteredRoutes.length > 0 ? (
          <ul className={styles.routeList}>
            {myRegisteredRoutes.map(route => (
              <li key={route.id} className={styles.routeItem}>
                <h3>{route.name}</h3>
                {route.mapPreviewUrl && <img src={route.mapPreviewUrl} alt={`${route.name} の地図プレビュー`} className={styles.mapPreview} />}
                <p>距離: {route.distance} | 所要時間: {route.estimatedTime}</p>
                <p>安全性評価: {'★'.repeat(route.safetyRating)}{'☆'.repeat(5 - route.safetyRating)}</p>
                <p>登録日: {route.createdAt}</p>
                {route.userReports && route.userReports.length > 0 && (
                    <div className={styles.userReports}>
                        <strong>ユーザー報告:</strong>
                        <ul>
                            {route.userReports.map((report, index) => <li key={index}>{report}</li>)}
                        </ul>
                    </div>
                )}
                <div className={styles.routeActions}>
                  <button className={styles.actionButton}>編集</button>
                  <button onClick={() => toggleMyRoute(route.id)} className={styles.actionButton}>マイルート解除</button>
                  <button onClick={() => toggleShareRoute(route.id)} className={`${styles.actionButton} ${route.shared ? styles.unshare : styles.share}`}>
                    {route.shared ? '共有中 (解除)' : '匿名で共有'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>マイルートに登録されたルートはありません。</p>
        )}
      </section>

      {/* 過去に記録・開拓した避難ルート一覧 (マイルート以外) */}
      <section className={styles.section}>
        <h2>その他の記録済みルート ({otherRoutes.length})</h2>
        {otherRoutes.length > 0 ? (
          <ul className={styles.routeList}>
            {otherRoutes.map(route => (
              <li key={route.id} className={styles.routeItem}>
                <h3>{route.name}</h3>
                {route.mapPreviewUrl && <img src={route.mapPreviewUrl} alt={`${route.name} の地図プレビュー`} className={styles.mapPreview} />}
                <p>距離: {route.distance} | 所要時間: {route.estimatedTime}</p>
                <p>安全性評価: {'★'.repeat(route.safetyRating)}{'☆'.repeat(5 - route.safetyRating)}</p>
                <p>登録日: {route.createdAt}</p>
                <div className={styles.routeActions}>
                  <button className={styles.actionButton}>詳細表示</button>
                  <button onClick={() => toggleMyRoute(route.id)} className={styles.actionButton}>マイルートに登録</button>
                  {/* ポイント獲得申請ボタンは条件に応じて表示 */}
                  <button className={styles.actionButton}>ポイント獲得申請</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>その他の記録済みルートはありません。</p>
        )}
        {/* TODO: 他のユーザーが共有したルートの検索・閲覧機能 */}
        <button className={styles.fullWidthButton}>他のユーザーの共有ルートを見る</button>
      </section>

      {/* ルート開拓ランキング */}
      <section className={styles.section}>
        <h2>ルート開拓ランキング (匿名)</h2>
        <table className={styles.rankingTable}>
            <thead>
                <tr>
                    <th>順位</th>
                    <th>ニックネーム</th>
                    <th>開拓数</th>
                    <th>総距離</th>
                </tr>
            </thead>
            <tbody>
                {mockRanking.map(user => (
                    <tr key={user.rank}>
                        <td>{user.rank}位</td>
                        <td>{user.nickname}</td>
                        <td>{user.routesOpened}件</td>
                        <td>{user.totalDistance}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </section>
    </div>
  );
};

export default MyRoutes;