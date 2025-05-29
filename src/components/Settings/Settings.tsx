import React, { useState } from 'react';
import styles from './Settings.module.css';

// 仮のデータ型定義
interface UserProfile {
  nickname: string;
  email: string; // 表示のみ、変更は別画面想定
}

interface NotificationSettings {
  drillReminders: boolean;
  disasterInfoUpdates: boolean;
  emergencyAlerts: boolean;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '防災ユーザー',
    email: 'user@example.com',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    drillReminders: true,
    disasterInfoUpdates: true,
    emergencyAlerts: true,
  });
  const [gpsConsent, setGpsConsent] = useState(true);
  const [offlineMapStatus, setOfflineMapStatus] = useState<string>('最新版をダウンロード済み'); // 例: '未ダウンロード', 'ダウンロード中...', 'xxMBダウンロード済み'

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, nickname: event.target.value }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGpsConsentChange = () => {
    setGpsConsent(prev => !prev);
    // TODO: 同意状態を保存
  };

  const handleDownloadOfflineMap = () => {
    setOfflineMapStatus('ダウンロード中...');
    // TODO: ダウンロード処理
    setTimeout(() => {
      setOfflineMapStatus('最新版をダウンロード済み (更新: 2025/05/29)');
      alert('オフラインマップのダウンロードが完了しました。');
    }, 3000);
  };

  const handleSaveChanges = () => {
    // TODO: 設定変更を保存するAPI呼び出し
    alert('設定を保存しました。');
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>設定</h1>
      </header>

      <main className={styles.mainContent}>
        {/* ユーザープロフィール */}
        <section className={styles.section}>
          <h2>ユーザープロフィール</h2>
          <div className={styles.formGroup}>
            <label htmlFor="nickname" className={styles.label}>ニックネーム:</label>
            <input
              type="text"
              id="nickname"
              value={profile.nickname}
              onChange={handleNicknameChange}
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>メールアドレス:</label>
            <p className={styles.staticInfo}>{profile.email} (<button className={styles.inlineButton}>変更</button>)</p>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>パスワード:</label>
            <p className={styles.staticInfo}>******** (<button className={styles.inlineButton}>変更</button>)</p>
          </div>
        </section>

        {/* 通知設定 */}
        <section className={styles.section}>
          <h2>通知設定</h2>
          <div className={styles.toggleGroup}>
            <label htmlFor="drillReminders" className={styles.toggleLabel}>避難訓練のリマインダー</label>
            <label className={styles.switch}>
              <input type="checkbox" id="drillReminders" checked={notifications.drillReminders} onChange={() => handleNotificationChange('drillReminders')} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleGroup}>
            <label htmlFor="disasterInfoUpdates" className={styles.toggleLabel}>防災情報の更新通知</label>
            <label className={styles.switch}>
              <input type="checkbox" id="disasterInfoUpdates" checked={notifications.disasterInfoUpdates} onChange={() => handleNotificationChange('disasterInfoUpdates')} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleGroup}>
            <label htmlFor="emergencyAlerts" className={styles.toggleLabel}>緊急情報アラート</label>
            <label className={styles.switch}>
              <input type="checkbox" id="emergencyAlerts" checked={notifications.emergencyAlerts} onChange={() => handleNotificationChange('emergencyAlerts')} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </section>

        {/* GPS利用同意 */}
        <section className={styles.section}>
          <h2>GPS利用設定</h2>
          <div className={styles.toggleGroup}>
            <label htmlFor="gpsConsent" className={styles.toggleLabel}>GPS利用を許可する</label>
            <label className={styles.switch}>
              <input type="checkbox" id="gpsConsent" checked={gpsConsent} onChange={handleGpsConsentChange} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <p className={styles.descriptionText}>ルート記録機能や現在地に基づく情報提供のためにGPSを利用します。</p>
        </section>

        {/* オフラインマップ */}
        <section className={styles.section}>
          <h2>オフラインマップ管理</h2>
          <p className={styles.statusText}>現在の状況: {offlineMapStatus}</p>
          <button onClick={handleDownloadOfflineMap} className={styles.actionButton} disabled={offlineMapStatus.includes('ダウンロード中')}>
            {offlineMapStatus.includes('未ダウンロード') ? 'オフラインマップをダウンロード' : 'オフラインマップを更新'}
          </button>
          <p className={styles.descriptionText}>災害時など通信が不安定な状況でも地図を利用できるように、事前にダウンロードしておくことを推奨します。</p>
        </section>

        {/* その他 */}
        <section className={styles.section}>
          <h2>その他</h2>
          <ul className={styles.linkList}>
            <li><button className={styles.linkButton}>プライバシーポリシー</button></li>
            <li><button className={styles.linkButton}>利用規約</button></li>
            <li><button className={styles.linkButton}>ヘルプ・FAQ</button></li>
            <li><button className={styles.linkButton}>お問い合わせ</button></li>
            <li><button className={`${styles.linkButton} ${styles.logoutButton}`}>ログアウト</button></li>
          </ul>
        </section>

        <button onClick={handleSaveChanges} className={styles.saveAllButton}>すべての変更を保存</button>
      </main>
    </div>
  );
};

export default Settings;