import React, { useState } from 'react';
import styles from './TrainingMap.module.css';
import EvacuationRouteMap from './EvacuationRouteMap/EvacuationRouteMap';
import L, { LatLng } from 'leaflet';

// --- 型定義 ---
interface PointExchangeItem {
  id: string;
  name: string;
  pointsRequired: number;
  type: 'goods' | 'discount';
}

interface RouteInfo {
  id: string;
  name: string;
  distance: string;
  time: string;
  safetyMemo: string;
  isSubmitted?: boolean; // 提出済みかどうか
}

interface Badge {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon?: string; // アイコン画像のパスなど
}

interface RankingEntry {
  rank: number;
  userName: string; // 匿名化された名前
  value: string; // 例: "30分", "2.5km", "評価スコア: 95"
}

interface SupportExperience {
  id: string;
  activityName: string;
  date: string;
  感想?: string;
}

interface Testimonial {
  id: string;
  userName: string; // 匿名
  comment: string;
  date: string;
}


const TrainingMap: React.FC = () => {
  // --- モックデータ ---
  const [currentPoints, setCurrentPoints] = useState<number>(1250);

  const pointExchangeItems: PointExchangeItem[] = [
    { id: 'item1', name: '防災用ホイッスル', pointsRequired: 300, type: 'goods' },
    { id: 'item2', name: '保存水500ml x 6本', pointsRequired: 800, type: 'goods' },
    { id: 'item3', name: '地元ベーカリー10%割引券', pointsRequired: 200, type: 'discount' },
  ];

  const myRoutes: RouteInfo[] = [
    { id: 'route1', name: '自宅から避難所A', distance: '2.1km', time: '25分', safetyMemo: '〇〇通りは道幅が狭いので注意', isSubmitted: true },
    { id: 'route2', name: '勤務先から一時避難場所B', distance: '1.5km', time: '18分', safetyMemo: '公園内を通過するルート。夜間は暗い可能性あり。', isSubmitted: false },
  ];

  const badges: Badge[] = [
    { id: 'b001', name: '初参加', description: '初めて避難訓練に参加しました！', achieved: true, icon: '🌟' },
    { id: 'b002', name: 'ルート投稿者', description: '初めてルートを投稿しました！', achieved: true, icon: '🗺️' },
    { id: 'b003', name: '10ルート投稿', description: '10個の避難ルートを投稿しました！', achieved: false, icon: '🏆' },
    { id: 'b004', name: '夜間訓練達成', description: '夜間訓練を無事達成しました！', achieved: true, icon: '🌙' },
  ];

  const rankings = {
    fastest: [
      { rank: 1, userName: 'UserA', value: '15分20秒' },
      { rank: 2, userName: 'UserB', value: '16分05秒' },
    ],
    shortest: [
      { rank: 1, userName: 'UserC', value: '1.2km' },
      { rank: 2, userName: 'UserD', value: '1.3km' },
    ],
    safety: [
      { rank: 1, userName: 'UserE', value: '安全評価: 98' },
      { rank: 2, userName: 'UserF', value: '安全評価: 95' },
    ],
  };

  const governmentAwards: string[] = [
    "〇〇市からの感謝状（2024年度上半期）",
    "優良ルート認定：XX小学校避難ルート（UserGさん投稿）",
  ];

  const supportExperiences: SupportExperience[] = [
    { id: 'exp1', activityName: '車いす体験', date: '2024-05-10', 感想: '段差の大変さがよくわかった。' },
    { id: 'exp2', activityName: 'アイマスク体験', date: '2024-05-18', 感想: '声かけの重要性を認識した。' },
  ];

  const testimonials: Testimonial[] = [
    {id: 't1', userName: '避難訓練参加者X', comment: 'ポイントで防災グッズがもらえるのが嬉しい。', date: '2024-06-01'},
    {id: 't2', userName: 'ルート投稿ユーザーY', comment: '自分のルートが他の人の役に立つかもしれないと思うとやりがいがある。', date: '2024-06-03'},
  ];

  // --- EvacuationRouteMap用の設定 ---
  // 環境変数からAPIキーを取得 (Viteの場合)
  // Create React Appの場合は process.env.REACT_APP_ORS_API_KEY
  const ORS_API_KEY: string | undefined = import.meta.env.VITE_REACT_APP_ORS_API_KEY;

  // 事前設定された開始・終了場所 (例)
  const [predefinedStartLocation] = useState<LatLng>(new LatLng(34.6873, 135.5259)); // 例: 大阪城公園駅
  const [predefinedEndLocation] = useState<LatLng>(new LatLng(34.6850, 135.5130));   // 例: 大阪駅

  // 事前設定されたユーザープロファイル (例: 通常の歩行者)
  // これはユーザー設定や訓練シナリオによって動的に変更される可能性がある
  const [userEvacuationProfile] = useState<'foot-walking' | 'wheelchair'>('foot-walking');

  // --- ハンドラ関数 ---
  const handleShowPointHistory = () => {
    alert('ポイント履歴確認機能は未実装です。');
    // TODO: ポイント履歴表示用のモーダルや別ページへの遷移を実装
  };

  const handleSubmitRoute = (routeId: string) => {
    alert(`ルートID: ${routeId} の提出処理は未実装です。`);
    // TODO: 実際にはAPIを呼び出してルートを提出し、ポイントを加算する
    // setCurrentPoints(prev => prev + 100); // 例: 100ポイント加算
  };

  const handleRegisterNewRoute = () => {
    alert('新規ルート登録機能（GPS記録など）は未実装です。');
  };

  const handleEditRoute = (routeId: string) => {
    alert(`ルートID: ${routeId} の編集機能は未実装です。`);
  };

  const handleViewRouteDetails = (routeId: string) => {
    alert(`ルートID: ${routeId} の詳細確認機能は未実装です。`);
  };

  const handlePostTestimonial = () => {
    const comment = prompt("体験談を入力してください:");
    if (comment) {
      alert(`体験談「${comment}」の投稿機能は未実装です。`);
      // TODO: 実際にはAPIを呼び出して投稿
    }
  };

  const handleTakeSurvey = () => {
    alert('アンケート機能は未実装です。');
    // TODO: アンケートページへの遷移やモーダル表示
  };


  return (
    <div className={styles.trainingMapContainer}>
      <header className={styles.header}>
        <h1>避難訓練マップ</h1>
      </header>

      {/* マップ表示部分のプレースホルダー */}
      <div className={styles.mapPlaceholder}>
        {ORS_API_KEY ? (
          <EvacuationRouteMap
            startLocation={predefinedStartLocation}
            endLocation={predefinedEndLocation}
            userProfile={userEvacuationProfile}
            apiKey={ORS_API_KEY}
          />
        ) : (
          <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>
          <p><strong>経路案内機能を利用できません。</strong></p>
          <p>APIキーが設定されていません。アプリケーションの設定を確認してください。</p>
          </div>
        )}
      </div>

      {/* 3.2 避難訓練実施後のポイントシステム連携 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ポイントシステム</h2>
        <div className={styles.pointDisplay}>
          現在のポイント数: <strong>{currentPoints} P</strong>
        </div>
        <button onClick={handleShowPointHistory} className={styles.button}>
          ポイント履歴確認
        </button>
        <div className={styles.pointExchange}>
          <h3>ポイント交換可能なアイテム</h3>
          {pointExchangeItems.length > 0 ? (
            <ul className={styles.itemList}>
              {pointExchangeItems.map(item => (
                <li key={item.id} className={styles.exchangeItem}>
                  <span>{item.name} ({item.type === 'goods' ? '防災グッズ' : '地域店舗割引'})</span>
                  <span>{item.pointsRequired} P</span>
                  <button className={styles.exchangeButton} onClick={() => alert(`${item.name}の交換機能は未実装`)}>交換</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>現在交換可能なアイテムはありません。</p>
          )}
        </div>
        <p className={styles.infoText}>※訓練への参加、ルート提出などでポイントが加算されます。</p>
      </section>

      {/* 3.3 ルート記録・投稿・管理機能 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ルート記録・投稿・管理</h2>
        <button onClick={handleRegisterNewRoute} className={`${styles.button} ${styles.buttonPrimary}`}>
          新しい避難ルートを記録・投稿する
        </button>
        <p className={styles.infoTextSmall}>GPS記録による避難ルートの可視化、情報（距離・時間・安全性メモ等）の投稿が可能です。</p>

        <div className={styles.bonusInfo}>
          <h3>ポイントボーナス情報</h3>
          <ul>
            <li>初回ルート投稿: +100P</li>
            <li>未踏エリアのルート開拓: +50P</li>
            <li>行政推薦ルートの踏破・報告: +200P</li>
          </ul>
        </div>

        <div className={styles.myRoutesSection}>
          <h3>「マイルート」一覧</h3>
          {myRoutes.length > 0 ? (
            <ul className={styles.itemList}>
              {myRoutes.map(route => (
                <li key={route.id} className={styles.routeItem}>
                  <div className={styles.routeItemInfo}>
                    <strong>{route.name}</strong>
                    <span>距離: {route.distance}, 目安時間: {route.time}</span>
                    <span>メモ: {route.safetyMemo}</span>
                  </div>
                  <div className={styles.routeItemActions}>
                    <button onClick={() => handleViewRouteDetails(route.id)} className={styles.buttonLink}>詳細</button>
                    <button onClick={() => handleEditRoute(route.id)} className={styles.buttonLink}>編集</button>
                    {!route.isSubmitted && (
                       <button onClick={() => handleSubmitRoute(route.id)} className={`${styles.button} ${styles.buttonSmall}`}>提出してポイント獲得</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>登録済みのマイルートはありません。</p>
          )}
        </div>
      </section>

      {/* 3.4 ゲーミフィケーション要素 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ランキング＆実績</h2>
        <div className={styles.rankingSection}>
          <h3>匿名ランキング</h3>
          <div className={styles.rankingCategory}>
            <h4>最速ルート</h4>
            {rankings.fastest.map(entry => <p key={entry.rank}>{entry.rank}位: {entry.userName} ({entry.value})</p>)}
          </div>
          <div className={styles.rankingCategory}>
            <h4>最短距離ルート</h4>
            {rankings.shortest.map(entry => <p key={entry.rank}>{entry.rank}位: {entry.userName} ({entry.value})</p>)}
          </div>
          <div className={styles.rankingCategory}>
            <h4>安全評価の高いルート</h4>
            {rankings.safety.map(entry => <p key={entry.rank}>{entry.rank}位: {entry.userName} ({entry.value})</p>)}
          </div>
        </div>

        <div className={styles.badgeSection}>
          <h3>実績バッジ</h3>
          <div className={styles.badgeGrid}>
            {badges.map(badge => (
              <div key={badge.id} className={`${styles.badgeItem} ${badge.achieved ? styles.achieved : ''}`}>
                <span className={styles.badgeIcon}>{badge.icon || '🎖️'}</span>
                <span className={styles.badgeName}>{badge.name}</span>
                {badge.achieved && <span className={styles.achievedMark}>達成!</span>}
                <p className={styles.badgeDescription}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.awardsSection}>
          <h3>表彰・フィードバック</h3>
          {governmentAwards.length > 0 ? (
            <ul>
              {governmentAwards.map((award, index) => <li key={index}>{award}</li>)}
            </ul>
          ) : (
            <p>現在、表彰情報はありません。</p>
          )}
        </div>
      </section>

      {/* 3.5 共助理解促進セクション */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>共助理解促進</h2>
        <div className={styles.supportExperienceSection}>
          <h3>支援体験の記録</h3>
          {supportExperiences.length > 0 ? (
            <ul className={styles.itemList}>
              {supportExperiences.map(exp => (
                <li key={exp.id} className={styles.supportExperienceItem}>
                  <strong>{exp.activityName}</strong> ({exp.date})
                  {exp.感想 && <p>感想: {exp.感想}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>記録された支援体験はありません。</p>
          )}
          <button className={styles.button} onClick={() => alert('支援体験の記録機能は未実装です。')}>新しい支援体験を記録</button>
        </div>

        <div className={styles.testimonialsSection}>
          <h3>参加者の声・体験談</h3>
          {testimonials.length > 0 ? (
             <ul className={styles.itemList}>
              {testimonials.map(testimonial => (
                <li key={testimonial.id} className={styles.testimonialItem}>
                  <p><strong>{testimonial.userName}</strong> ({testimonial.date})</p>
                  <p>「{testimonial.comment}」</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>まだ体験談はありません。</p>
          )}
          <button onClick={handlePostTestimonial} className={styles.button}>体験談を投稿する</button>
        </div>

        <div className={styles.surveySection}>
          <h3>アンケート</h3>
          <p>多様な人々への配慮・支援に関する気づきを共有しましょう。</p>
          <button onClick={handleTakeSurvey} className={styles.button}>アンケートに回答する</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2025 避難訓練アプリ</p>
      </footer>
    </div>
  );
};

export default TrainingMap;