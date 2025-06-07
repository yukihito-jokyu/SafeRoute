import React, { useState, useEffect, ChangeEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'; // Map を LeafletMap としてインポート
import type * as GeoJSON from 'geojson';

// GeoJSON の型 (簡易的なもの、必要に応じて @types/geojson などを利用)
// openrouteservice-js が提供する型を利用するのが望ましい
// import { DirectionsResponse } from 'openrouteservice-js'; // openrouteservice-js が型を提供している場合

// openrouteservice-js の Directions API レスポンスの型 (簡易版)
// 正式な型定義はライブラリのものを参照・利用してください
interface OrsFeature extends GeoJSON.Feature<GeoJSON.LineString> {
  // properties や bbox など、必要に応じて追加
}

interface OrsDirectionsResponse extends GeoJSON.FeatureCollection<GeoJSON.LineString> {
  features: OrsFeature[];
  // bbox や metadata など、必要に応じて追加
}


// --- OpenRouteService ---
import Openrouteservice from 'openrouteservice-js';

// --- 設定 ---
const ORS_API_KEY: string | undefined = import.meta.env.VITE_REACT_APP_ORS_API_KEY;

// Openrouteservice のインスタンス作成時に API キーが undefined の場合のフォールバックやエラー処理が必要
// ここでは API キーが string であることを期待して進めますが、実際には undefined の場合の処理が必要です。
let ors = null;
if (ORS_API_KEY) {
  ors = new Openrouteservice.Directions({ api_key: ORS_API_KEY });
} else {
  console.warn("ORS API Key is not defined. Routing will not work.");
  // ここでユーザーに通知するなどの処理を行うこともできます
}


const defaultPosition: LatLng = new LatLng(34.6851, 135.5130); // 大阪駅周辺 (例)

// プロファイルの型を定義
type RoutingProfile = 'foot-walking' | 'wheelchair' | 'cycling-regular'; // 必要に応じて拡張


export const OsakaMap = () => {
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null); // L.LatLng[] を使用
  const [profile, setProfile] = useState<RoutingProfile>('foot-walking');
  const [map, setMap] = useState<LeafletMap | null>(null); // map インスタンスを保持
  setMap(null);

  const handleMapClick = (event: LeafletMouseEvent): void => {
    if (!startPoint) {
      setStartPoint(event.latlng);
    } else if (!endPoint) {
      setEndPoint(event.latlng);
    }
  };

  // 地図クリックイベントを処理するコンポーネント
  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const calculateRoute = async (): Promise<void> => {
    if (!startPoint || !endPoint) {
      alert("出発地と目的地を設定してください。");
      return;
    }
    if (!ors) { // ors インスタンスが初期化されているか確認
      alert("経路サービスが初期化されていません。APIキーを確認してください。");
      return;
    }

    try {
      // openrouteservice-js が提供する型を使用するのが最も良い
      // ここでは any を使っていますが、実際のプロジェクトでは適切な型を指定してください
      const response: OrsDirectionsResponse = await ors.calculate({
        coordinates: [
          [startPoint.lng, startPoint.lat], // ORS は [経度, 緯度] の順
          [endPoint.lng, endPoint.lat]
        ],
        profile: profile,
        format: 'geojson', // 結果を日本語で取得する場合（地名など）
        // preference: 'fastest' // 例: 最速ルートを優先 (openrouteservice-js のオプションによる)
      }) as OrsDirectionsResponse; // キャスト (ライブラリの型と一致させる)


      if (response.features && response.features.length > 0) {
        // Polyline 用に座標を抽出 [緯度, 経度] の順に変換し、L.LatLng オブジェクトの配列にする
        const routeCoordinates: LatLng[] = response.features[0].geometry.coordinates.map(
          (coord: number[]) => new LatLng(coord[1], coord[0]) // coord は [lng, lat]
        );
        setRoute(routeCoordinates);

        // ルート全体が表示されるように地図の表示範囲を調整
        if (map && routeCoordinates.length > 0) {
          const bounds = L.latLngBounds(routeCoordinates);
          map.fitBounds(bounds);
        }

      } else {
        alert("経路が見つかりませんでした。");
        setRoute(null);
      }
    } catch (error: any) { // エラーの型をより具体的にすることも可能
      console.error("経路計算エラー:", error);
      let errorMessage = "経路計算エラーが発生しました。";
      if (error?.message) {
        errorMessage += ` ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += ` ${error}`;
      } else if (error?.response?.data?.error?.message) { // ORSのエラーレスポンス形式に合わせる (例)
        errorMessage += ` ${error.response.data.error.message}`;
      }
      alert(errorMessage);
      setRoute(null);
    }
  };

  const clearRoute = (): void => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    if (map) {
      map.setView(defaultPosition, 13); // デフォルトの表示位置に戻す
    }
  };

  const handleProfileChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setProfile(e.target.value as RoutingProfile); // 型アサーション
  };

  // APIキーがない場合の警告表示をuseEffectで管理（マウント時のみ）
  useEffect(() => {
    if (!ORS_API_KEY) {
      // アラートではなく、UI上に永続的なメッセージとして表示することを検討
      console.warn("REACT_APP_ORS_API_KEY が設定されていません。経路検索機能は利用できません。");
    }
  }, []);

  return (
    <div>
      <header style={{ padding: '10px', textAlign: 'center' }}>
        <h1>OpenRouteService React 地図</h1>
        <div>
          <label htmlFor="profile">移動手段: </label>
          <select id="profile" value={profile} onChange={handleProfileChange}>
            <option value="foot-walking">歩き</option>
            <option value="wheelchair">車いす</option>
            <option value="cycling-regular">自転車</option> {/* 例として追加 */}
          </select>
        </div>
        <button onClick={calculateRoute} disabled={!startPoint || !endPoint || !ors}>
          経路を検索
        </button>
        <button onClick={clearRoute} style={{ marginLeft: '10px' }}>
          クリア
        </button>
        <p>地図上をクリックして出発地と目的地を設定してください。</p>
      </header>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler /> {/* 地図クリックイベントハンドラ */}

        {startPoint && <Marker position={startPoint}><Popup>出発地</Popup></Marker>}
        {endPoint && <Marker position={endPoint}><Popup>目的地</Popup></Marker>}

        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>

      {!ORS_API_KEY && ( // この警告はORS_API_KEYがビルド時に未定義だった場合に表示
        <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          <strong>警告:</strong> 環境変数 REACT_APP_ORS_API_KEY が設定されていません。
          プロジェクトルートの .env ファイルに API キーを設定してください。経路検索は機能しません。
        </p>
      )}
    </div>
  )
}
