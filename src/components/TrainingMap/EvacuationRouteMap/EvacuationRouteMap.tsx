import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
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
  properties?: any;
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

  const [statusMessage, setStatusMessage] = useState<string>('準備完了。避難開始ボタンを押してください。');
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);

  // APIキーが変更された場合、または初回にORSインスタンスを初期化
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
        language: 'ja',
        instructions: false, // 指示は不要なため無効化
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


  // 初期経路計算 (propsが変更された場合も対応)
  useEffect(() => {
    if (startLocation && endLocation && userProfile && !isNavigating) { // ナビゲーション中でなければ初期経路を計算
        calculateAndSetRoute(startLocation, endLocation, userProfile);
    }
  }, [startLocation, endLocation, userProfile, calculateAndSetRoute, isNavigating]);


  const startNavigation = () => {
    if (!route) {
      setStatusMessage("経路が設定されていません。まず経路を検索してください。");
      calculateAndSetRoute(startLocation, endLocation, userProfile); // 開始時に経路がなければ再計算
      // この後、routeが設定されたら再度startNavigationをユーザーが押す必要があるかもしれない。
      // もしくは、calculateAndSetRouteが成功した後に自動でナビゲーションを開始するロジックを追加。
      return;
    }

    setIsNavigating(true);
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
            mapInstance.panTo(newPos); // 現在地に地図をパン
          }
          checkIfOffRoute(newPos, route);
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
    setStatusMessage("避難を中断/終了しました。");
    if (timerIntervalId.current) {
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
    }
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    // setCurrentPosition(null); // 停止時に現在地マーカーを消す場合
  };

  const checkIfOffRoute = (currentPos: LatLng, currentRoute: LatLng[] | null) => {
    if (!currentRoute || currentRoute.length === 0 || !currentPos) {
      setIsOffRoute(false);
      return;
    }

    const thresholdDistance = 50; // 50メートル以上離れたらルート逸脱とみなす
    let onRoute = false;

    // ルート上の各線分に対して現在地からの最短距離を計算し、閾値以下ならオンルート
    // ここでは簡略化のため、ルート上のいずれかのポイントから一定距離以内かで判定
    // より正確には線分への垂線の距離を計算する必要がある
    for (let i = 0; i < currentRoute.length; i++) {
      if (currentPos.distanceTo(currentRoute[i]) < thresholdDistance) {
        onRoute = true;
        break;
      }
    }
    
    if (!onRoute) {
      setIsOffRoute(true);
      setStatusMessage("ルートを外れました。経路を再検索します...");
      // 自動でリルート: 現在地から目的地までの経路を再計算
      calculateAndSetRoute(currentPos, endLocation, userProfile);
    } else {
      setIsOffRoute(false);
      // ナビゲーション中のメッセージを維持したい場合は、ここでのsetStatusMessageは避けるか条件分岐
      if (isNavigating && !statusMessage.startsWith("経路を再設定しました。")) { // 再設定直後でなければ
        setStatusMessage("ルート上を移動中です。");
      }
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };


  // MapContainerにmapインスタンスをセットするためのコンポーネント
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
        {!isNavigating ? (
          <button onClick={startNavigation} className={`${styles.button} ${styles.startButton}`} disabled={!route || !ors}>
            避難開始
          </button>
        ) : (
          <button onClick={stopNavigation} className={`${styles.button} ${styles.stopButton}`}>
            避難停止
          </button>
        )}
      </div>
      <div className={styles.statusDisplay}>
        {statusMessage}
      </div>
      <MapContainer
        center={startLocation || new LatLng(34.6851, 135.5130)} // フォールバック位置
        zoom={15}
        className={styles.mapView} // CSSモジュールでスタイルを適用
      >
        <MapInstanceSetter />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* {startLocation && <Marker position={startLocation}><Popup>出発地</Popup></Marker>} */}
        {endLocation && <Marker position={endLocation}><Popup>避難場所</Popup></Marker>}
        {currentPosition && (
          <CircleMarker center={currentPosition} radius={8} color="blue" fillColor="blue" fillOpacity={0.8}>
            <Popup>現在地</Popup>
          </CircleMarker>
        )}
        {route && <Polyline positions={route} color={isOffRoute ? "red" : "green"} weight={5} />}
      </MapContainer>
    </div>
  );
};

export default EvacuationRouteMap;