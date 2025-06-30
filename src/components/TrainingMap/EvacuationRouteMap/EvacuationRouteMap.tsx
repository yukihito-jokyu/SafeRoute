import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, Map as LeafletMap } from 'leaflet';
import Openrouteservice from 'openrouteservice-js';
import styles from './EvacuationRouteMap.module.css';

// アイコン設定 (react-leaflet のデフォルトアイコン問題対応)
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- 型定義 ---
type RoutingProfile = 'foot-walking' | 'wheelchair'; // 避難訓練で想定されるプロファイル

interface OrsFeature extends GeoJSON.Feature<GeoJSON.LineString | GeoJSON.Point> {
  properties: any;
}
interface OrsDirectionsResponse extends GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.Point> {
  features: OrsFeature[];
  bbox?: GeoJSON.BBox;
  metadata?: any;
}

interface EvacuationRouteMapProps {
  startLocation: LatLng;      // 事前設定された開始地点
  endLocation: LatLng;        // 事前設定された終了地点
  userProfile: RoutingProfile;  // 事前設定されたユーザープロファイル
  apiKey?: string;              // OpenRouteService APIキー
}

// OpenRouteServiceのインスタンス (APIキーが提供された場合に初期化)
let ors: Openrouteservice.Directions | null = null;

const EvacuationRouteMap: React.FC<EvacuationRouteMapProps> = ({
  startLocation,
  endLocation,
  userProfile,
  apiKey
}) => {
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalId = useRef<NodeJS.Timeout | null>(null);
  const watchId = useRef<number | null>(null);
  const isNavigatingRef = useRef<boolean>(isNavigating);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  const [statusMessage, setStatusMessage] = useState<string>('準備完了。避難開始ボタンを押してください。');
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [canCompleteEvacuation, setCanCompleteEvacuation] = useState<boolean>(false);

  // --- ▼ 変更点 1/2: ドロップダウンメニューの開閉状態を管理するstateを追加 ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // --- ▲ 変更点 1/2 ---

  useEffect(() => {
    if (apiKey) {
      ors = new Openrouteservice.Directions({ api_key: apiKey });
      setStatusMessage('経路サービス準備完了。');
    } else {
      ors = null;
      setStatusMessage('警告: APIキーが設定されていません。経路案内は利用できません。');
      console.warn("ORS API Key is not provided. Routing will not work.");
    }
  }, [apiKey]);

  const calculateAndSetRoute = useCallback(async (start: LatLng, end: LatLng, profile: RoutingProfile) => {
    if (!ors) {
      setStatusMessage("エラー: 経路サービスが利用できません。");
      return;
    }
    if (!start || !end) {
        setStatusMessage("エラー: 出発地または目的地が不正です。");
        return;
    }

    setStatusMessage("経路を検索中...");
    try {
      const response: OrsDirectionsResponse = await ors.calculate({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ],
        profile: profile,
        format: 'geojson',
      }) as OrsDirectionsResponse;

      if (response.features && response.features.length > 0 && response.features[0].geometry.type === 'LineString') {
        const routeCoordsGeoJSON = response.features[0].geometry.coordinates as number[][];
        const leafletRouteCoords: LatLng[] = routeCoordsGeoJSON.map(coord => new LatLng(coord[1], coord[0]));
        setRoute(leafletRouteCoords);
        setIsOffRoute(false);
        setStatusMessage(isNavigating ? "経路を再設定しました。" : "経路が見つかりました。");

        if (mapInstance) {
          const bounds = L.latLngBounds(leafletRouteCoords.concat(currentPosition ? [currentPosition] : []));
          mapInstance.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        setRoute(null);
        setStatusMessage("経路が見つかりませんでした。");
      }
    } catch (error: any) {
      console.error("経路計算エラー:", error);
      setStatusMessage(`経路計算エラー: ${error.message || '不明なエラー'}`);
      setRoute(null);
    }
  }, [mapInstance, isNavigating, currentPosition]);


  useEffect(() => {
    if (startLocation && endLocation && userProfile && !isNavigating) {
        calculateAndSetRoute(startLocation, endLocation, userProfile);
    }
  }, [startLocation, endLocation, userProfile, calculateAndSetRoute, isNavigating]);

  const checkIfNearDestination = useCallback((currentPos: LatLng) => {
    if (!endLocation || !currentPos) return;

    const distanceToDestination = currentPos.distanceTo(endLocation);
    console.log(distanceToDestination)
    const arrivalThreshold = 30;

    if (distanceToDestination < arrivalThreshold) {
      setCanCompleteEvacuation(true);
      setStatusMessage("避難場所に到着しました。避難完了ボタンを押してください。");
    } else {
      setCanCompleteEvacuation(false);
    }
  }, [endLocation]);

  const startNavigation = () => {
    if (!route) {
      setStatusMessage("経路が設定されていません。まず経路を検索してください。");
      calculateAndSetRoute(startLocation, endLocation, userProfile);
      return;
    }

    setIsNavigating(true);
    setCanCompleteEvacuation(false);
    setElapsedTime(0);
    setStatusMessage("避難を開始しました。GPSで現在地を追跡します。");

    timerIntervalId.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = new LatLng(position.coords.latitude, position.coords.longitude);
          setCurrentPosition(newPos);
          if (mapInstance) {
            mapInstance.panTo(newPos);
          }
          checkIfOffRoute(newPos, route);
          console.log(isNavigating)
          if (isNavigatingRef.current) {
            checkIfNearDestination(newPos);
          }
        },
        (error) => {
          console.error("GPSエラー:", error);
          setStatusMessage(`GPSエラー: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatusMessage("お使いのブラウザはGPS機能に対応していません。");
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCanCompleteEvacuation(false);
    setStatusMessage("避難を中断/終了しました。");
    if (timerIntervalId.current) {
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
    }
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const handleCompleteEvacuation = () => {
    stopNavigation();
    setShowCompletionModal(true);
    setStatusMessage(`避難完了！所要時間: ${formatTime(elapsedTime)}`);
  };

  const handleSaveToMyRoute = () => {
    console.log("「マイルートに設定」がクリックされました。");
    console.log("避難ルート:", route);
    console.log("所要時間:", formatTime(elapsedTime));
    setShowCompletionModal(false);
    setStatusMessage("ルートをマイルートに保存しました（仮）");
  };

  const checkIfOffRoute = (currentPos: LatLng, currentRoute: LatLng[] | null) => {
    if (!currentRoute || currentRoute.length === 0 || !currentPos) {
      setIsOffRoute(false);
      return;
    }

    const thresholdDistance = 50;
    let onRoute = false;

    for (let i = 0; i < currentRoute.length; i++) {
      if (currentPos.distanceTo(currentRoute[i]) < thresholdDistance) {
        onRoute = true;
        break;
      }
    }
    
    if (!onRoute) {
      setIsOffRoute(true);
      setStatusMessage("ルートを外れました。経路を再検索します...");
      console.log("koko")
      calculateAndSetRoute(currentPos, endLocation, userProfile);
    } else {
      setIsOffRoute(false);
      if (!canCompleteEvacuation && isNavigating && !statusMessage.startsWith("経路を再設定しました。")) {
        setStatusMessage("ルート上を移動中です。");
      }
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };


  const MapInstanceSetter = () => {
    const map = useMap();
    useEffect(() => {
      setMapInstance(map);
    }, [map]);
    return null;
  };


  return (
    <div className={styles.evacuationMapContainer}>
      {!apiKey && (
         <div className={styles.warningBanner}>
           ORS APIキーが設定されていません。管理者に連絡するか、設定を確認してください。経路案内は利用できません。
         </div>
      )}
      <div className={styles.controlsContainer}>
        <div className={styles.timerDisplay}>
          経過時間: {formatTime(elapsedTime)}
        </div>

        {/* --- ▼ 変更点 2/2: ここにトグルボタンのコードを挿入 --- */}
        <div className={styles.dropdown}>
          <button onClick={() => setIsMenuOpen(prev => !prev)} className={`${styles.button} ${styles.menuButton}`}>
            ルート選択 ▼
          </button>
          <div className={`${styles.dropdownContent} ${isMenuOpen ? styles.show : ''}`}>
            <button
              onClick={() => {
                // ここに「車椅子ルート切替」のロジックを実装
                alert('車椅子ルートへの切り替え機能を実装します。');
                setIsMenuOpen(false); // メニューを閉じる
              }}
              className={styles.subButton}
            >
              車椅子ルート切替
            </button>
            <button
              onClick={() => {
                // ここに「出発地を現在地に設定」のロジックを実装
                alert('出発地を現在地に設定する機能を実装します。');
                setIsMenuOpen(false);
              }}
              className={styles.subButton}
            >
              自転車ルート切替
            </button>
            <button onClick={() => { alert('ダミーボタンです'); setIsMenuOpen(false); }} className={styles.subButton}>
              徒歩ルート切替
            </button>
          </div>
        </div>
        {/* --- ▲ 変更点 2/2 --- */}

        {!isNavigating ? (
          <button onClick={startNavigation} className={`${styles.button} ${styles.startButton}`} disabled={!route || !ors}>
            避難開始
          </button>
        ) : (
          <>
            <button 
              onClick={stopNavigation} 
              className={`${styles.button} ${styles.stopButton}`}
              disabled={showCompletionModal}
            >
              避難中断
            </button>
            {canCompleteEvacuation && (
              <button 
                onClick={handleCompleteEvacuation} 
                className={`${styles.button} ${styles.completeButton}`}
                disabled={showCompletionModal}
              >
                避難完了 🎉
              </button>
            )}
          </>
        )}
      </div>
      <div className={styles.statusDisplay}>
        {statusMessage}
      </div>
      <MapContainer
        center={startLocation || new LatLng(34.6851, 135.5130)}
        zoom={15}
        className={styles.mapView}
      >
        <MapInstanceSetter />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {startLocation && <Marker position={startLocation}><Popup>出発地</Popup></Marker>}
        {endLocation && <Marker position={endLocation}><Popup>避難場所</Popup></Marker>}
        {currentPosition && (
          <CircleMarker center={currentPosition} radius={8} color="blue" fillColor="blue" fillOpacity={0.8}>
            <Popup>現在地</Popup>
          </CircleMarker>
        )}
        {route && <Polyline positions={route} color={isOffRoute ? "red" : "green"} weight={5} />}
      </MapContainer>

      {showCompletionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>避難完了！</h2>
            <p>お疲れ様でした。</p>
            <div className={styles.modalInfo}>
              <p><strong>避難場所:</strong> {endLocation.toString()}</p>
              <p><strong>所要時間:</strong> {formatTime(elapsedTime)}</p>
            </div>
            <button onClick={handleSaveToMyRoute} className={`${styles.button} ${styles.modalButton}`}>
              このルートをマイルートに設定
            </button>
            <button onClick={() => setShowCompletionModal(false)} className={`${styles.button} ${styles.modalCloseButton}`}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvacuationRouteMap;