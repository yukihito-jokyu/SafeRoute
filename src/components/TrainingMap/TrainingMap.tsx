import React, { useState } from 'react';
import styles from './TrainingMap.module.css';
import EvacuationRouteMap from './EvacuationRouteMap/EvacuationRouteMap';
import { LatLng } from 'leaflet';

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

// interface RankingEntry {
//   rank: number;
//   userName: string; // 匿名化された名前
//   value: string; // 例: "30分", "2.5km", "評価スコア: 95"
// }

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

interface PointHistoryEntry {
  id: string;
  date: string;
  activity: string;
  points: number;
  type: 'earned' | 'spent';
}

interface SurveyAnswer {
  question: string;
  answer: string;
}


const TrainingMap: React.FC = () => {
  // --- モックデータ ---
  const [currentPoints, setCurrentPoints] = useState<number>(15);
  
  // --- モーダル状態管理 ---
  const [showPointHistory, setShowPointHistory] = useState<boolean>(false);
  const [showNewRouteModal, setShowNewRouteModal] = useState<boolean>(false);
  const [showEditRouteModal, setShowEditRouteModal] = useState<boolean>(false);
  const [showRouteDetailsModal, setShowRouteDetailsModal] = useState<boolean>(false);
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);
  const [showNewExperienceModal, setShowNewExperienceModal] = useState<boolean>(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  
  // --- ポイント履歴データ ---
  const [pointHistory, setPointHistory] = useState<PointHistoryEntry[]>([
    { id: 'ph1', date: '2024-06-01', activity: '初回ルート投稿', points: 100, type: 'earned' },
    { id: 'ph2', date: '2024-06-05', activity: '避難訓練参加', points: 50, type: 'earned' },
    { id: 'ph3', date: '2024-06-10', activity: '体験談投稿', points: 30, type: 'earned' },
  ]);
  
  // --- アンケート設定 ---
  const [surveyQuestions] = useState<string[]>([
    'どのような支援が必要な方々への配慮を考えましたか？',
    '避難訓練で気づいた改善点はありますか？',
    'より多くの人が参加しやすくするための提案があれば教えてください。'
  ]);
  
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([]);
  
  // --- 新規ルート登録用の状態 ---
  const [newRouteData, setNewRouteData] = useState({
    name: '',
    distance: '',
    time: '',
    safetyMemo: ''
  });
  
  // --- 支援体験記録用の状態 ---
  const [newExperienceData, setNewExperienceData] = useState({
    activityName: '',
    感想: ''
  });
  
  const [myRoutes, setMyRoutes] = useState<RouteInfo[]>([
    { id: 'route1', name: '自宅から避難所A', distance: '2.1km', time: '25分', safetyMemo: '〇〇通りは道幅が狭いので注意', isSubmitted: true },
    { id: 'route2', name: '勤務先から一時避難場所B', distance: '1.5km', time: '18分', safetyMemo: '公園内を通過するルート。夜間は暗い可能性あり。', isSubmitted: false },
  ]);
  
  const [supportExperiences, setSupportExperiences] = useState<SupportExperience[]>([
    { id: 'exp1', activityName: '車いす体験', date: '2024-05-10', 感想: '段差の大変さがよくわかった。' },
    { id: 'exp2', activityName: 'アイマスク体験', date: '2024-05-18', 感想: '声かけの重要性を認識した。' },
  ]);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {id: 't1', userName: '避難訓練参加者X', comment: 'ポイントで防災グッズがもらえるのが嬉しい。', date: '2024-06-01'},
    {id: 't2', userName: 'ルート投稿ユーザーY', comment: '自分のルートが他の人の役に立つかもしれないと思うとやりがいがある。', date: '2024-06-03'},
  ]);

  const pointExchangeItems: PointExchangeItem[] = [
    { id: 'item1', name: '防災用ホイッスル', pointsRequired: 300, type: 'goods' },
    { id: 'item2', name: '保存水500ml x 6本', pointsRequired: 800, type: 'goods' },
    { id: 'item3', name: '地元ベーカリー10%割引券', pointsRequired: 200, type: 'discount' },
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

  // --- EvacuationRouteMap用の設定 ---
  // 環境変数からAPIキーを取得 (Viteの場合)
  // Create React Appの場合は process.env.REACT_APP_ORS_API_KEY
  const ORS_API_KEY: string | undefined = import.meta.env.VITE_REACT_APP_ORS_API_KEY;

  // 事前設定された開始・終了場所 (例)
  const [predefinedStartLocation] = useState<LatLng>(new LatLng(34.6997872, 135.4929524)); // 例: 大阪城公園駅
  const [predefinedEndLocation] = useState<LatLng>(new LatLng(34.6864668, 135.5249972));   // 例: 大阪駅

  // 事前設定されたユーザープロファイル (例: 通常の歩行者)
  // これはユーザー設定や訓練シナリオによって動的に変更される可能性がある
  const [userEvacuationProfile] = useState<'foot-walking' | 'wheelchair'>('foot-walking');

  // --- ハンドラ関数 ---
  const handleShowPointHistory = () => {
    setShowPointHistory(true);
  };

  const handleSubmitRoute = (routeId: string) => {
    // ルートを提出済みに更新
    setMyRoutes(prev => prev.map(route => 
      route.id === routeId ? { ...route, isSubmitted: true } : route
    ));
    // ポイント加算
    setCurrentPoints(prev => prev + 100);
    // 履歴に追加
    setPointHistory(prev => [...prev, {
      id: `ph${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      activity: `ルート提出: ${myRoutes.find(r => r.id === routeId)?.name || ''}`,
      points: 100,
      type: 'earned'
    }]);
    alert('ルートが提出されました。100ポイントを獲得しました！');
  };

  const handleRegisterNewRoute = () => {
    setShowNewRouteModal(true);
  };

  const handleEditRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setShowEditRouteModal(true);
  };

  const handleViewRouteDetails = (routeId: string) => {
    setSelectedRouteId(routeId);
    setShowRouteDetailsModal(true);
  };

  const handlePostTestimonial = () => {
    const comment = prompt("体験談を入力してください:");
    if (comment) {
      const newTestimonial = {
        id: `t${Date.now()}`,
        userName: `参加者${Math.floor(Math.random() * 1000)}`,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      setTestimonials(prev => [...prev, newTestimonial]);
      setCurrentPoints(prev => prev + 30);
      setPointHistory(prev => [...prev, {
        id: `ph${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        activity: '体験談投稿',
        points: 30,
        type: 'earned'
      }]);
      alert('体験談が投稿されました。30ポイントを獲得しました！');
    }
  };

  const handleTakeSurvey = () => {
    setShowSurveyModal(true);
  };

  const handleAddNewExperience = () => {
    setShowNewExperienceModal(true);
  };

  const handleExchangeItem = (item: PointExchangeItem) => {
    if (currentPoints >= item.pointsRequired) {
      if (window.confirm(`${item.name}を${item.pointsRequired}ポイントで交換しますか？`)) {
        setCurrentPoints(prev => prev - item.pointsRequired);
        setPointHistory(prev => [...prev, {
          id: `ph${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          activity: `アイテム交換: ${item.name}`,
          points: item.pointsRequired,
          type: 'spent'
        }]);
        alert(`${item.name}を交換しました！`);
      }
    } else {
      alert('ポイントが不足しています。');
    }
  };

  const handleSaveNewRoute = () => {
    if (newRouteData.name && newRouteData.distance && newRouteData.time) {
      const newRoute: RouteInfo = {
        id: `route${Date.now()}`,
        name: newRouteData.name,
        distance: newRouteData.distance,
        time: newRouteData.time,
        safetyMemo: newRouteData.safetyMemo,
        isSubmitted: false
      };
      setMyRoutes(prev => [...prev, newRoute]);
      setNewRouteData({ name: '', distance: '', time: '', safetyMemo: '' });
      setShowNewRouteModal(false);
      alert('新しいルートが保存されました！');
    }
  };

  const handleSaveExperience = () => {
    if (newExperienceData.activityName && newExperienceData.感想) {
      const newExperience: SupportExperience = {
        id: `exp${Date.now()}`,
        activityName: newExperienceData.activityName,
        date: new Date().toISOString().split('T')[0],
        感想: newExperienceData.感想
      };
      setSupportExperiences(prev => [...prev, newExperience]);
      setNewExperienceData({ activityName: '', 感想: '' });
      setShowNewExperienceModal(false);
      alert('支援体験が記録されました！');
    }
  };

  const handleSubmitSurvey = () => {
    if (surveyAnswers.length === surveyQuestions.length) {
      // アンケート回答を保存（実際のアプリケーションではAPIに送信）
      console.log('Survey submitted:', surveyAnswers);
      setCurrentPoints(prev => prev + 50);
      setPointHistory(prev => [...prev, {
        id: `ph${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        activity: 'アンケート回答',
        points: 50,
        type: 'earned'
      }]);
      setSurveyAnswers([]);
      setShowSurveyModal(false);
      alert('アンケートが提出されました。50ポイントを獲得しました！');
    } else {
      alert('すべての質問に回答してください。');
    }
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
                  <button className={styles.exchangeButton} onClick={() => handleExchangeItem(item)}>交換</button>
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
        <div className={styles.supportSection}>
          <h3>支援体験記録</h3>
          <div className={styles.experienceList}>
            {supportExperiences.map(exp => (
              <div key={exp.id} className={styles.experienceItem}>
                <h4>{exp.activityName}</h4>
                <p>実施日: {exp.date}</p>
                <p>感想: {exp.感想}</p>
              </div>
            ))}
          </div>
          <button className={styles.button} onClick={handleAddNewExperience}>新しい支援体験を記録</button>
        </div>

        <div className={styles.testimonialsSection}>
          <h3>体験談</h3>
          <div className={styles.testimonialsList}>
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className={styles.testimonialItem}>
                <p>"{testimonial.comment}"</p>
                <small>- {testimonial.userName} ({testimonial.date})</small>
              </div>
            ))}
          </div>
          <button className={styles.button} onClick={handlePostTestimonial}>体験談を投稿</button>
        </div>

        <div className={styles.surveySection}>
          <h3>アンケート</h3>
          <p>避難訓練での気づきや改善提案をお聞かせください。</p>
          <button className={styles.button} onClick={handleTakeSurvey}>アンケートに回答</button>
        </div>
      </section>

      {/* ポイント履歴モーダル */}
      {showPointHistory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>ポイント履歴</h3>
            <div className={styles.pointHistoryList}>
              {pointHistory.map(entry => (
                <div key={entry.id} className={styles.pointHistoryItem}>
                  <div className={styles.pointHistoryInfo}>
                    <span className={styles.pointHistoryActivity}>{entry.activity}</span>
                    <span className={styles.pointHistoryDate}>{entry.date}</span>
                  </div>
                  <span className={`${styles.pointHistoryPoints} ${
                    entry.type === 'earned' ? styles.pointsEarned : styles.pointsSpent
                  }`}>
                    {entry.type === 'earned' ? '+' : '-'}{entry.points}P
                  </span>
                </div>
              ))}
            </div>
            <button className={styles.button} onClick={() => setShowPointHistory(false)}>閉じる</button>
          </div>
        </div>
      )}

      {/* 新規ルート登録モーダル */}
      {showNewRouteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>新しい避難ルートを登録</h3>
            <div className={styles.formGroup}>
              <label>ルート名:</label>
              <input
                type="text"
                value={newRouteData.name}
                onChange={(e) => setNewRouteData({...newRouteData, name: e.target.value})}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>距離:</label>
              <input
                type="text"
                value={newRouteData.distance}
                onChange={(e) => setNewRouteData({...newRouteData, distance: e.target.value})}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>所要時間:</label>
              <input
                type="text"
                value={newRouteData.time}
                onChange={(e) => setNewRouteData({...newRouteData, time: e.target.value})}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>安全性メモ:</label>
              <textarea
                value={newRouteData.safetyMemo}
                onChange={(e) => setNewRouteData({...newRouteData, safetyMemo: e.target.value})}
                className={styles.textarea}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={handleSaveNewRoute}>保存</button>
              <button className={styles.button} onClick={() => setShowNewRouteModal(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* ルート編集モーダル */}
      {showEditRouteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>ルートを編集</h3>
            <p>選択されたルートID: {selectedRouteId}</p>
            <div className={styles.formGroup}>
              <label>ルート名:</label>
              <input
                type="text"
                value={myRoutes.find(r => r.id === selectedRouteId)?.name || ''}
                className={styles.input}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label>距離:</label>
              <input
                type="text"
                value={myRoutes.find(r => r.id === selectedRouteId)?.distance || ''}
                className={styles.input}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label>所要時間:</label>
              <input
                type="text"
                value={myRoutes.find(r => r.id === selectedRouteId)?.time || ''}
                className={styles.input}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label>安全性メモ:</label>
              <textarea
                value={myRoutes.find(r => r.id === selectedRouteId)?.safetyMemo || ''}
                className={styles.textarea}
                readOnly
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={() => setShowEditRouteModal(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* ルート詳細モーダル */}
      {showRouteDetailsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>ルート詳細</h3>
            {myRoutes.find(r => r.id === selectedRouteId) && (
              <div className={styles.routeDetails}>
                <h4>{myRoutes.find(r => r.id === selectedRouteId)?.name}</h4>
                <p><strong>距離:</strong> {myRoutes.find(r => r.id === selectedRouteId)?.distance}</p>
                <p><strong>所要時間:</strong> {myRoutes.find(r => r.id === selectedRouteId)?.time}</p>
                <p><strong>安全性メモ:</strong> {myRoutes.find(r => r.id === selectedRouteId)?.safetyMemo}</p>
                <p><strong>状態:</strong> {myRoutes.find(r => r.id === selectedRouteId)?.isSubmitted ? '提出済み' : '未提出'}</p>
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={() => setShowRouteDetailsModal(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* アンケートモーダル */}
      {showSurveyModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>アンケート</h3>
            <div className={styles.surveyForm}>
              {surveyQuestions.map((question, index) => (
                <div key={index} className={styles.formGroup}>
                  <label>{question}</label>
                  <textarea
                    value={surveyAnswers.find(a => a.question === question)?.answer || ''}
                    onChange={(e) => {
                      const newAnswers = [...surveyAnswers];
                      const existingIndex = newAnswers.findIndex(a => a.question === question);
                      if (existingIndex >= 0) {
                        newAnswers[existingIndex].answer = e.target.value;
                      } else {
                        newAnswers.push({ question, answer: e.target.value });
                      }
                      setSurveyAnswers(newAnswers);
                    }}
                    className={styles.textarea}
                  />
                </div>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={handleSubmitSurvey}>提出</button>
              <button className={styles.button} onClick={() => setShowSurveyModal(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 支援体験記録モーダル */}
      {showNewExperienceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>新しい支援体験を記録</h3>
            <div className={styles.formGroup}>
              <label>体験した活動名:</label>
              <input
                type="text"
                value={newExperienceData.activityName}
                onChange={(e) => setNewExperienceData({...newExperienceData, activityName: e.target.value})}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>感想:</label>
              <textarea
                value={newExperienceData.感想}
                onChange={(e) => setNewExperienceData({...newExperienceData, 感想: e.target.value})}
                className={styles.textarea}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={handleSaveExperience}>保存</button>
              <button className={styles.button} onClick={() => setShowNewExperienceModal(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingMap;