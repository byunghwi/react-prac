
import React, { useEffect, useRef } from 'react';
import useMapStore from "../stores/map";

export default function BaseMap() {
  const { actions: {initMap}, rightTools } = useMapStore();
  const mapRef = useRef(null); // ref 생성

  useEffect(() => {
    // 컴포넌트가 마운트될 때 맵 초기화
    initMap(mapRef.current);
  }, [initMap]);

  return (
    // <div className="wrap-table-cell" ref={mapRef} tabIndex="0"></div>
    <div className="wrap-table-cell" ref={mapRef} tabIndex="0"></div>
  )

}