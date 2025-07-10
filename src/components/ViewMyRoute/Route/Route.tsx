import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, Map as LeafletMap } from 'leaflet';
import Openrouteservice from 'openrouteservice-js';
import { dummy } from '@/components/TrainingMap/EvacuationRouteMap/dummy/dummy';
import styles from './Route.module.css';

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

const Route: React.FC = () => {
  const apiKey: string | undefined = import.meta.env.VITE_REACT_APP_ORS_API_KEY;
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(dummy.map(point => new L.LatLng(point.lat, point.lng)));
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

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
      
      <MapContainer
        // center={startLocation || new LatLng(34.6851, 135.5130)}
        center={new LatLng(34.6851, 135.5130)}
        zoom={15}
        className={styles.mapView}
      >
        <MapInstanceSetter />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* {startLocation && <Marker position={startLocation}><Popup>出発地</Popup></Marker>}
        {endLocation && <Marker position={endLocation}><Popup>避難場所</Popup></Marker>} */}
        {currentPosition && (
          <CircleMarker center={currentPosition} radius={8} color="blue" fillColor="blue" fillOpacity={0.8}>
            <Popup>現在地</Popup>
          </CircleMarker>
        )}
        {route && <Polyline positions={route} color={"green"} weight={5} />}
      </MapContainer>
    </div>
  );
};

export default Route;