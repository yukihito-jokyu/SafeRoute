import React from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router';

// 仮のデータ型定義
interface LatestDrillInfo {
  id: string;
  name: string;
  date: string;
  type: '推奨' | '新規';
}

interface QuickAccessRoute {
  id: string;
  name: string;
}

interface SafetyStatusSummary {
  family: string;
  group: string;
}

interface SystemNotification {
  id: string;
  message: string;
  date: string;
}

const Dashboard: React.FC = () => {
  // 仮のデータ
  const currentPoints: number = 15;
  const latestDrill: LatestDrillInfo = {
    id: 'drill-001',
    name: '地域合同避難訓練2025春',
    date: '2025/06/15 10:00',
    type: '推奨',
  };
  const myRouteQuickAccess: QuickAccessRoute[] = [
    { id: 'route-001', name: '自宅から避難所A' },
    { id: 'route-002', name: '勤務先から広域避難場所B' },
  ];
  const safetyStatus: SafetyStatusSummary = {
    family: '全員無事',
    group: '3人/5人 確認済み',
  };
  const notifications: SystemNotification[] = [
    { id: 'sys-002', message: '次回の定期メンテナンスは6月10日です。', date: '2025/05/25' },
  ];

  const navigate = useNavigate();

  const clickNav = (path: string) => {
    navigate(path);
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>ダッシュボード</h1>
      </header>

      {/* ナビゲーションメニュー (実際にはハンバーガーメニュー等で実装) */}
      <nav className={styles.navMenu}>
        <button className={styles.navButton} onClick={() => clickNav("/evacuation")}>避難訓練情報</button>
        <button className={styles.navButton} onClick={() => clickNav("/myroutes")}>マイルート</button>
        <button className={styles.navButton} onClick={() => clickNav("/points")}>ポイント</button>
        <button className={styles.navButton} onClick={() => clickNav("/settings")}>設定</button>
      </nav>

      <main className={styles.mainContent}>
        {/* 現在のポイント残高 */}
        <section className={styles.section}>
          <h2>現在のポイント残高</h2>
          <p className={styles.pointBalance}>{currentPoints} P</p>
        </section>

        {/* 最新の避難訓練情報 */}
        <section className={styles.section}>
          <h2>最新の避難訓練情報</h2>
          <div className={styles.drillInfoCard}>
            <span className={`${styles.drillType} ${latestDrill.type === '推奨' ? styles.recommended : styles.new}`}>
              {latestDrill.type}
            </span>
            <h3>{latestDrill.name}</h3>
            <p>日時: {latestDrill.date}</p>
            <button onClick={() => clickNav("/evacuation")} className={styles.actionButton}>詳細を見る</button>
          </div>
        </section>

        {/* 「マイルート」へのクイックアクセス */}
        <section className={styles.section}>
          <h2>「マイルート」へのクイックアクセス</h2>
          <ul className={styles.quickAccessList}>
            {myRouteQuickAccess.map(route => (
              <li key={route.id} className={styles.quickAccessItem}>
                {route.name}
                <button className={styles.actionButtonSmall}>表示</button>
              </li>
            ))}
          </ul>
          <button onClick={() => clickNav("/myroutes")} className={styles.fullWidthButton}>マイルート一覧へ</button>
        </section>

        {/* 防災知識学習コンテンツへのショートカット */}
        {/* <section className={styles.section}>
          <h2>防災知識学習</h2>
          <div className={styles.learningContents}>
            <button className={styles.learningButton}>地震発生時の初動</button>
            <button className={styles.learningButton}>応急手当の方法</button>
            <button className={styles.learningButton}>備蓄品の確認</button>
          </div>
          <button className={styles.fullWidthButton}>もっと学ぶ</button>
        </section> */}

        {/* 安否登録状況（家族・グループ）のサマリー */}
        <section className={styles.section}>
          <h2>安否登録状況</h2>
          <div className={styles.safetyStatus}>
            <p>家族: {safetyStatus.family}</p>
            <p>グループ: {safetyStatus.group}</p>
          </div>
          <button onClick={() => clickNav("/settings")} className={styles.fullWidthButton}>安否確認・登録へ</button>
        </section>

        {/* システムからのお知らせ */}
        <section className={styles.section}>
          <h2>システムからのお知らせ</h2>
          <ul className={styles.notificationList}>
            {notifications.map(notif => (
              <li key={notif.id} className={styles.notificationItem}>
                <p>{notif.message}</p>
                <small>{notif.date}</small>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;