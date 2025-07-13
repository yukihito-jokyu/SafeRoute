import React from 'react';
import styles from './ViewMyRoute.module.css';
import Route from './Route/Route';



const ViewMyRoute: React.FC = () => {
  // --- EvacuationRouteMap用の設定 ---
  // 環境変数からAPIキーを取得 (Viteの場合)
  // Create React Appの場合は process.env.REACT_APP_ORS_API_KEY
  const ORS_API_KEY: string | undefined = import.meta.env.VITE_REACT_APP_ORS_API_KEY;


  return (
    <div className={styles.trainingMapContainer}>
      <header className={styles.header}>
        <h1>My Route</h1>
      </header>

      {/* マップ表示部分のプレースホルダー */}
      <div className={styles.mapPlaceholder}>
        {ORS_API_KEY ? (
          // <EvacuationRouteMap
          //   startLocation={predefinedStartLocation}
          //   endLocation={predefinedEndLocation}
          //   userProfile={userEvacuationProfile}
          //   apiKey={ORS_API_KEY}
          // />
          <Route />
        ) : (
          <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>
          <p><strong>経路案内機能を利用できません。</strong></p>
          <p>APIキーが設定されていません。アプリケーションの設定を確認してください。</p>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2025 避難訓練アプリ</p>
      </footer>
    </div>
  );
};

export default ViewMyRoute;