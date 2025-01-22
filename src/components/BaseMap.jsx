
import React, { useEffect, useRef } from 'react';
import useMapStore from '../stores/map';
import '../styles/register.css'

export default function BaseMap() {
  const { initMap, clearMap } = useMapStore();
  const mapRef = useRef(null); // ref 생성

  useEffect(() => {
    // 컴포넌트가 마운트될 때 맵 초기화
    initMap(mapRef.current);

    return (()=>{
      clearMap();
    })
  }, []);

  return (
    <section id="container">
      <div className="wrapper">
        <div className="map_wrapper">
          <div className="map" ref={mapRef} tabIndex={0}></div>
          {/* <div class="wrap-right-control">
            <mapType/>
            <!-- <button type="button" v-if="rightTools.removeSector" @click="toggleRightTools('removeSector')" name="새로고침">새로고침</button> -->
          </div> */}
        </div>
      </div>
    </section>
  )

}