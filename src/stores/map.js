import useCorridorStore from "./corridor";
import { create } from 'zustand';

import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import VectorSource from 'ol/source/Vector.js';
import {Vector as VectorLayer, Layer} from 'ol/layer.js';
import Feature from 'ol/Feature.js'
import { Point, LineString, Polygon } from 'ol/geom'
import {get as getProjection, fromLonLat, transform} from 'ol/proj.js';
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import LayerTile from 'ol/layer/Tile.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import WMTS from 'ol/source/WMTS.js';
import { getTopLeft, getWidth } from 'ol/extent.js';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { Fill, Icon, Stroke, Style, Text, Circle as CircleStyle } from 'ol/style.js'
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import IC_WP from '../assets/icon/waypoint.svg'
import IC_VP from '../assets/icon/ic_vertiport_grey.svg'
import IC_VP_RED from '../assets/icon/ic_vertiport_red.svg'

proj4.defs('EPSG:5179', '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs');
register(proj4);
const epsg_5179 = getProjection('EPSG:5179');
epsg_5179.setExtent([-200000.0, -28024123.62, 31824123.62, 4000000.0]);
const epsg_3857 = getProjection('EPSG:3857');
const epsg_3857_extent = epsg_3857.getExtent();
const epsg_3857_size = getWidth(epsg_3857_extent) / 256;
const epsg_3857_resolutions = new Array(19);
const epsg_3857_matrixIds = new Array(19);
const epsg_5179_extent = epsg_5179.getExtent();
const epsg_4326 = getProjection('EPSG:4326');
const epsg_4326_extent = epsg_4326.getExtent();
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  epsg_3857_resolutions[z] = epsg_3857_size / Math.pow(2, z);
  epsg_3857_matrixIds[z] = z;
}

let tileNames_en = [
  "satellite_map",
  "white_map",
  "night_map",
  "korean_map",
];

const useMapStore = create((set, get) => {
  // VectorSource를 먼저 초기화합니다.
  const vectorSource = new VectorSource({ features: [] });

  // VectorLayer를 vectorSource가 초기화된 후에 생성합니다.
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 3,
    style: (feature, resolution) => {
      let styles = {
        MultiPolygon: new Style({
          stroke: new Stroke({
            color: 'blue',
            width: 5,
          }),
        }),
      };
      return styles[feature.getGeometry().getType()];
    },
    updateWhileAnimating: true,
    updateWhileInteracting: true,
  });

  return {
    layerGroup: {},
    olMap: null,
    mapMode: 0,
    vectorSource,
    vectorLayer,
    rightTools: {
      map: false,
      removeSector: false,
    },
    lines: { sid: {}, corridor: {}, corridorCenter: {}, star: {}, mine: {}, mineunion: {}, corridorText: {} },
    myCorridor: {},
    hideStyle: [
      new Style({
        stroke: new Stroke({
          color: `rgba(0,0,0,0)`,
          width: 0,
        }),
        fill: new Fill({ color: `rgba(0,0,0,0)` }),
      }),
    ],

    actions: {
      drawCorridors: () => {
        // 구현 필요
      },
      initMap: async (map) => {
        const { olMap, vectorLayer, layerGroup, actions: {addLayer, mapEvent, transformCoords} } = get();
        set((state) => ({
          ...state,
          layerGroup: {}, // 새로운 layerGroup으로 업데이트
        }));
        let initCenter = transform([126.713, 37.555], 'EPSG:4326', 'EPSG:5179');
        let initZoom = 11;
        let initMinZoom = 5;
        let initMaxZoom = 18;

        // WMTS 옵션 설정
        const wmtEmapOption = {
          url: "//map.ngii.go.kr/openapi/Gettile.do?apikey=9FDC4C793C40A600159CF4B5E8BC5748",
          matrixSet: "EPSG:5179",
          format: "image/png",
          projection: epsg_5179,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(epsg_5179.getExtent()),
            resolutions: [2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28, 32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255],
            matrixIds: ["L05", "L06", "L07", "L08", "L09", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17", "L18"],
          }),
          style: 'korean',
          wrapX: true,
          attributions: [
            '<img style="width:96px; height:16px;" src="http://map.ngii.go.kr/img/process/ms/map/common/img_btoLogo3.png" alt="로고">'
          ],
          crossOrigin: 'anonymous',
        };

        // 레이어 그룹 초기화
        for (let i = 0; i < tileNames_en.length; i++) {
          layerGroup[tileNames_en[i]] = new LayerTile({
            visible: false,
          });
        }
        layerGroup['default'] = vectorLayer;

        // OpenLayers 맵 초기화
        set((state) => ({
          ...state,
          olMap: new Map({
            layers: [vectorLayer],
            target: map,
            view: new View({
              projection: 'EPSG:5179',
              center: initCenter,
              zoom: initZoom,
              maxZoom: initMaxZoom,
              minZoom: initMinZoom,
              minResolution: 0.255,
              constrainResolution: false,
            }),
            controls: [],
          }), // 새로운 layerGroup으로 업데이트
        }));

        // WMTS 레이어 추가
        for (let i = 0; i < tileNames_en.length; i++) {
          const layerName = tileNames_en[i];
          layerGroup[layerName].setSource(new WMTS({
            ...wmtEmapOption,
            name: layerName,
            layer: layerName,
          }));

          addLayer(tileNames_en[i], layerGroup[tileNames_en[i]]);
        }

        // dim 처리할 폴리곤 영역 설정
        let worldPolygonCoords = transformCoords([[
          [124.0, 33.0],
          [131.0, 33.0],
          [131.0, 43.0],
          [124.0, 43.0],
          [124.0, 33.0],
        ]], 'EPSG:4326', 'EPSG:5179');
        let worldPolygon = new Polygon(worldPolygonCoords);
        let worldPolygonFeature = new Feature({ geometry: worldPolygon, group: 'dim' });
        let dimStyle = new Style({
          fill: new Fill({
            color: 'rgba(16, 24, 40, 0.6)',
          }),
        });
        let dimSource = new VectorSource({
          features: [worldPolygonFeature],
        });
        let dimLayer = new VectorLayer({
          source: dimSource,
          zIndex: 3,
          style: dimStyle,
        });
        addLayer('dimLayer', dimLayer);

        layerGroup[tileNames_en[0]].setVisible(true);
        mapEvent();
      },
      mapEvent: () => {
        const { olMap } = get();

        // [1] 마우스 오버
        olMap.on('pointermove', function (e) {
          olMap.getTarget().style.cursor = 'default'; // 기본 커서 설정
          const pixel = olMap.getEventPixel(e.originalEvent);
          olMap.forEachFeatureAtPixel(pixel, function (feature) {
            if (feature.get('group') === 'mySector') {
              olMap.getTarget().style.cursor = 'pointer';
              return true; // 루프 중지
            }
          });
        });

        // [2] 마우스 클릭
        olMap.getViewport().addEventListener('mousedown', function (e) {
          olMap.forEachFeatureAtPixel(olMap.getEventPixel(e), function (feature, layer) {
            const corridorStoreState = useCorridorStore.getState(); // zustand의 상태 가져오기
            const mySector = corridorStoreState.mySector;
            const corridorDetail = corridorStoreState.corridorDetail;
            if (feature) {
              if (feature.getGeometry().getType() === "LineString" && feature.getId()?.startsWith('corridor_Center_') && feature.get('group')) {
                if (feature.get('selected')) {
                  if (corridorDetail === feature.get('corridor')) {
                    feature.set('selected', false);
                    feature.setStyle(feature.get("st"));
                  } else {
                    let corridorDashLayer = get().getLayer('corridorDashLayer');
                    let corridorDashSource = corridorDashLayer?.getSource();
                    corridorDashSource.removeFeature(feature);
                  }

                  const indexToRemove = mySector.findIndex(
                    (ind) =>
                      ind.corridor === feature.get("corridor") &&
                      ind.index === feature.get("index")
                  );

                  if (indexToRemove !== -1) {
                    mySector.splice(indexToRemove, 1);
                    corridorStoreState.setMySector([...mySector]); // 새로운 배열로 상태 업데이트
                  }
                } else {
                  let centerStyle = function (feature) {
                    const styles = [
                      new Style({
                        stroke: new Stroke({
                          color: `rgba(235, 150, 2, 1)`,
                          width: 3,
                          lineDash: [5, 10],
                          lineDashOffset: 0,
                        }),
                      }),
                    ];
                    return styles;
                  };
                  feature.setStyle(centerStyle);
                  feature.set('selected', true);

                  mySector.push({
                    index: feature.get("index"),
                    corridor: feature.get("corridor"),
                    prev: feature.get("prev"),
                    next: feature.get("next"),
                  });

                  mySector.sort((a, b) => {
                    if (a.corridor === b.corridor) {
                      return a.index - b.index; // corridor이 같을 때는 index로 오름차순
                    }
                    return a.corridor.localeCompare(b.corridor);
                  });

                  corridorStoreState.setMySector([...mySector]); // 새로운 배열로 상태 업데이트
                }
              }
            }
          });
        });
      },
      // 레이어 추가
      addLayer: (name, layer) => {
        const { layerGroup, olMap } = get();
        layerGroup[name] = layer;
        olMap.addLayer(layer);
      },
      transformCoords: (coords, sourceProj, targetProj) => {
        return coords.map(ring => ring.map(coord => transform(coord, sourceProj, targetProj)));
      },
      // 레이어 가져오기
      getLayer: (name) => {
        const { layerGroup } = get();
        return layerGroup[name];
      },
    },
  };
})

export default useMapStore;
