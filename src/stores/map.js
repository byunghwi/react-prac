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
import IC_WP from '../assets/icon/waypoint.svg';
import IC_VP from '../assets/icon/ic_vertiport_grey.svg';
import IC_VP_RED from '../assets/icon/ic_vertiport_red.svg';
import * as turf from '@turf/turf';
import UtilFunc from "../utils/functions";

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
      drawCorridors: (corridors, group, isCenter) => {
        const { olMap, lines, myCorridor, hideStyle, actions: {getLayer, addLayer, transformCoords, addFeaturePoint, showVertiport}} = get();
        const corridorStoreState = useCorridorStore.getState(); // zustand의 상태 가져오기
        let features = [];
        let dashs = [];
        let corridorLayer = getLayer('corridorLayer');
        let corridorSource = corridorLayer?.getSource();
        let corridorDashLayer = getLayer('corridorDashLayer');
        let corridorDashSource = corridorDashLayer?.getSource();
        let baseColor = "70, 73, 81"; // 관리하지 않는 회랑 // UtilFunc.getRandomColor();
        let centerStyle = function (feature) {
          const styles = [
            new Style({
              stroke: new Stroke({
                color: `rgba(255,255,255, 1)`,
                width: 3,
                lineDash: [5,10],
                lineDashOffset: 0
              }),
            }),
          ];
          return styles;
        };
        let showArr = ['center', 'waypoint', 'name'];
        if(!corridorLayer){
          const defaultStyle = {
            'fill-color': ['get', 'fillColor'],
            'stroke-color': ['get', 'strokeColor'],
            'stroke-width': ['get', 'strokeWidth'],
            'point-size' :  ['get', 'pointSize'],
          };
          class WebGLLayer extends VectorLayer {
            constructor(options) {
              super(options);
              this.currentStyle = options.style || defaultStyle;
            }
            createRenderer() {
              return new WebGLVectorLayerRenderer(this, {
                style: this.currentStyle,
              });
            }
            setStyle(newStyle) {
              if(newStyle){
                this.currentStyle = newStyle;
                this.changed();
              }
            }
          }
          corridorSource = new VectorSource({
            features: features
          });
          corridorLayer = new WebGLLayer({
            source: corridorSource,
            zIndex: 3,
          })
          addLayer('corridorLayer', corridorLayer);
        }
        if(!corridorDashLayer){
          corridorDashSource = new VectorSource({
            features: dashs
          });
          corridorDashLayer = new VectorLayer({
            source: corridorDashSource,
            zIndex: 3,
          });
          addLayer('corridorDashLayer', corridorDashLayer);
        }
        corridors.forEach(async(corridor) => {
          let arrCorridor = corridor.corridorDetail;
          let arrPolygon = corridor.corridorPolygon;

          // [1] Polygon(폭)
          if(corridorSource.getFeatureById('cdPolygon_'+corridor.corridorCode)){
            let feature = corridorSource.getFeatureById('cdPolygon_'+corridor.corridorCode);
            if(showArr.includes('width')){ // show 폭
              feature.set('fillColor', `rgba(0,0,0,0)`)
              feature.set('strokeColor', `rgba(115, 118, 127, 1)`)
              feature.set('strokeWidth',1)
            }else{ // hide
              feature.set('fillColor','rgba(0, 0, 0, 0)')
              feature.set('strokeColor','rgba(0, 0, 0, 0)')
              feature.set('strokeWidth',0)
            }
          }else{
            arrPolygon?.map(ind=>{
              let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:5179'
              });
              jsonfeatures.forEach(feature => {
                if(showArr.includes('width')){ // show 폭
                  feature.set('fillColor', `rgba(0,0,0,0)`)
                  feature.set('strokeColor', `rgba(115, 118, 127, 1)`)
                  feature.set('strokeWidth',1)
                }else{ // hide
                  feature.set('fillColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeWidth',0)
                }
                feature.setId('cdPolygon_'+corridor.corridorCode)
                lines.corridor[corridor.corridorCode] = feature;
                features.push(feature);
              });
            })
          }
          // [2] Sid, Star
          corridor.corridorSidStar?.map(ind=>{
            let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:5179'
            });
            jsonfeatures.forEach(feature => {
              if(ind.sidStar=="sid"){
                if(showArr.includes('width')){ // show 폭
                  feature.set('fillColor', 'rgba(38, 201, 126, 0.3)')
                  feature.set('strokeColor', `rgba(38, 201, 126, 1)`)
                  feature.set('strokeWidth', 1)
                }else{ // hide
                  feature.set('fillColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeWidth',0)
                }
              }else{
                if(showArr.includes('width')){ // show 폭
                  feature.set('fillColor', 'rgba(235, 78, 2, 0.3)')
                  feature.set('strokeColor', `rgba(235, 78, 2, 1)`)
                  feature.set('strokeWidth', 1)
                }else{ // hide
                  feature.set('fillColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeColor','rgba(0, 0, 0, 0)')
                  feature.set('strokeWidth',0)
                }
              }
              lines[ind.sidStar][corridor.corridorCode] = feature;
              features.push(feature);
            });
          })
          // [3] my corridor
          arrCorridor.map((item,i)=>{ // 그리려는 회랑과 내가 관리하는 회랑이 일치하면 lines.mine에 저장
            if(i<arrCorridor.length-1){
              let comp1 = item.waypointCode + arrCorridor[i+1].waypointCode;
              myCorridor.userPolygon?.map(ind=>{
                let linkId = ind.linkId;
                if(!lines.mine[linkId]){
                  if(comp1==linkId){
                    let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
                      dataProjection: 'EPSG:4326',
                      featureProjection: 'EPSG:5179'
                    });
                    jsonfeatures.forEach(feature => {
                      lines.mine[linkId] = feature;
                    });
                  }
                }
              })
            }
          });
          let mypolygons = [];
          Object.keys(lines.mine).forEach(ind=>{
            let f = corridor.corridorLinkPolygon?.find(jnd=>jnd.linkId==ind)
            if(f){
              let coords = transformCoords(lines.mine[ind].getGeometry().getCoordinates(), 'EPSG:5179', 'EPSG:4326');
              mypolygons.push(turf.polygon(coords));
              // let transformedPolygonCoords = transformCoords(coords, 'EPSG:4326', 'EPSG:5179');
              // let intersectPolygon = new Polygon(transformedPolygonCoords);
              // let intersectFeature = new Feature(intersectPolygon);
              // intersectFeature.set('fillColor', `rgba(93, 147, 255, 0.3)`)
              // intersectFeature.set('strokeColor', `rgba(93, 147, 255, 1)`)
              // intersectFeature.set('strokeWidth', 1)
              // features.push(intersectFeature)
            }
          })

          // [4] Center Line
          for(var i=0; i<arrCorridor.length-1; i++){
            if(corridorDashSource.getFeatureById('corridor_Center_' + corridor.corridorCode + "_" + i)){
              let segmentLine = corridorDashSource.getFeatureById('corridor_Center_' + corridor.corridorCode + "_" + i);
              if(showArr.includes('center')){ // show 중심선
                segmentLine.setStyle(centerStyle)
              }else{ // hide
                segmentLine.setStyle(hideStyle);
              }
            }else{
              let prev = transform([arrCorridor[i].waypointLon, arrCorridor[i].waypointLat], 'EPSG:4326', 'EPSG:5179')
              let next = transform([arrCorridor[i+1].waypointLon, arrCorridor[i+1].waypointLat], 'EPSG:4326', 'EPSG:5179')
              let segmentLine = new Feature({geometry: new LineString([prev,next]), type:"Ani"});
              if(showArr.includes('center')){ // show 중심선
                segmentLine.setStyle(centerStyle)
                segmentLine.set('st', centerStyle)
                if(group){
                  segmentLine.set('group', group)
                  segmentLine.set('corridor', corridor.corridorCode)
                  segmentLine.set('index', arrCorridor[i].waypointIndex)
                  segmentLine.set('prev', arrCorridor[i].waypointCode)
                  segmentLine.set('next', arrCorridor[i+1].waypointCode)
                }
              }else{ // hide
                segmentLine.setStyle(hideStyle);
                segmentLine.set('st', hideStyle)
              }
              segmentLine.setId('corridor_Center_' + corridor.corridorCode + "_" + i)
              lines.corridorCenter[corridor.corridorCode + '_' + i] = segmentLine;
              dashs.push(segmentLine)
            }
          }
          // [5] waypoints
          let waypoints = arrCorridor.filter(item=>item.pointType=='waypoint').map((item,i)=>{
            return {
              styleType: "Waypoint", id:item.waypointCode, name: item.waypointCode,
              lon: item.waypointLon, lat: item.waypointLat}
          });
          addFeaturePoint(waypoints)
          // [6] vertiports
          let vertiports = arrCorridor.filter(item=>item.pointType=='vertiport').map((item,i)=>{
            return {id:item.waypointCode, lon:item.waypointLon, lat:item.waypointLat}
          })
          showVertiport(vertiports)
        })
        if(features.length>0) {
          corridorSource.addFeatures(features); // 새로운 데이터 추가
        }
        if(dashs.length>0) {
          corridorDashSource.addFeatures(dashs); // 새로운 데이터 추가
        }
        if(isCenter && corridorDashSource){
          olMap.getView().fit(corridorDashSource.getExtent(),{
            padding: [50, 50, 50, 50] // [top, right, bottom, left]
          });
        }
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
                    corridorStoreState.actions.setMySector([...mySector]); // 새로운 배열로 상태 업데이트
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

                  corridorStoreState.actions.setMySector([...mySector]); // 새로운 배열로 상태 업데이트
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
      addFeaturePoint: (list) => {
        const corridorStoreState = useCorridorStore.getState(); // zustand의 상태 가져오기
        const { actions: {getLayer,addLayer,layerStyleFunc} } = get();
        let features = [];
        let waypointLayer = getLayer('waypointLayer');
        let waypointSource = waypointLayer?.getSource();
        if(!waypointLayer) {
          waypointSource = new VectorSource({
            features: features,
          });
          // waypointLayer = new WebGLPointsLayer({
          //   source: waypointSource,
          //   zIndex: 3,
          //   style: {
          //     "icon-src" : IC_WP,
          //     "icon-height": 32,
          //     "icon-width" : 32,
          //     "icon-size" : [32,32],
          //     "icon-scale" : UtilFunc.calculateScale(olMap.value.getView().getZoom()),
          //   }
          // });
          waypointLayer = new VectorLayer({
            source: waypointSource,
            zIndex: 3,
            style: (feature) => layerStyleFunc('waypointLayer', feature)
          });
          addLayer('waypointLayer', waypointLayer);
          // const textLayer = new VectorLayer({
          //   source: waypointSource,  // 동일한 피처에 텍스트 적용
          //   zIndex: 3,
          //   style: (feature) => layerStyleFunc('waypointLayer', feature)
          // });
          // addLayer('textLayer', textLayer);
        }
        let showArr = ['center', 'waypoint', 'name'];
        list.map(ind=>{
          let feature = waypointSource?.getFeatureById(ind.id);
          let newPoint = new Point(transform([ind.lon, ind.lat], 'EPSG:4326', 'EPSG:5179'));
          if(!feature){
            if(showArr.includes('waypoint')){
              let options = { geometry: newPoint, type: ind.styleType};
              if(showArr.includes('name')){
                if(ind.id) options.id = ind.id;
                if(ind.name) options.nm = ind.name;
              }
              feature = new Feature(options)
              if(ind.id) feature.setId(ind.id)
              features.push(feature);
            }
          }else{
            if(showArr.includes('waypoint')){
              if(showArr.includes('name')){
                if(ind.id) feature.set('id', ind.id)
                if(ind.name) feature.set('nm', ind.name)
              }else{
                feature.set('id', null)
                feature.set('nm', null)
              }
              feature.setGeometry(newPoint);
            }else{
              waypointSource.removeFeature(feature)
            }
          }
        })
        if(features.length>0) {
          waypointSource.addFeatures(features);
        }
      },
      // 레이어 스타일
      layerStyleFunc: (name, feature) => {
        const { olMap, } = get();
        // Cluster는 여러 개의 개별 피처를 하나의 클러스터로 그룹화합니다.
        // Cluster를 사용하면, 클러스터에 포함된 개별 피처들을 get('features')를 통해 배열로 가져올 수 있습니다.
        // 그래서 feature.get('features')는 클러스터 내부의 피처 배열을 반환합니다.
        switch (name) {
          case 'vertiportLayer': {
            let img = (feature.get('status') == 'UNAVAILABLE' || feature.get('warning')) ? IC_VP_RED : IC_VP;
            let style = [
              new Style({
                image: new Icon({
                  src: img,
                  scale: UtilFunc.calculateScale(olMap.getView().getZoom()),
                  opacity: 1
                }),
              }),
              new Style({
                text: new Text({
                  text: feature.get('id'),
                  font: 'normal normal normal 9px/11px Pretendard',
                  fill: new Fill({
                    color: '#ffffff',
                  }),
                  offsetY: 24 * UtilFunc.calculateScale(olMap.getView().getZoom()),
                  scale: UtilFunc.calculateScaleText(olMap.getView().getZoom()),
                }),
              }),
            ];
            if(feature.get('ETA')){
              style.push(new Style({
                text: new Text({
                  text: feature.get('ETA'),
                  font: 'normal normal normal 9px/11px Pretendard',
                  fill: new Fill({
                    color: '#d9d9d9',
                  }),
                  offsetY: 35 * UtilFunc.calculateScale(olMap.getView().getZoom()),
                  scale: UtilFunc.calculateScaleText(olMap.getView().getZoom()),
                })
              }))
            }
            return style
          }
          case 'waypointLayer': {
            let style = [
              new Style({
                image: new Icon({
                  src: IC_WP,
                  scale: UtilFunc.calculateScale(olMap.getView().getZoom()),
                  opacity: 1
                }),
              }),
              new Style({
                text: new Text({
                  text: feature.get('nm'),
                  font: 'normal normal normal 9px/11px Pretendard',
                  fill: new Fill({
                    color: '#b3b3b3',
                  }),
                  offsetY: 25 * UtilFunc.calculateScale(olMap.getView().getZoom()),
                  scale: UtilFunc.calculateScaleText(olMap.getView().getZoom()),
                }),
              }),
            ]
            if(feature.get('ETA')){
              style.push(new Style({
                text: new Text({
                  text: feature.get('ETA'),
                  font: 'normal normal normal 9px/11px Pretendard',
                  fill: new Fill({
                    color: '#d9d9d9',
                  }),
                  offsetY: 25 * UtilFunc.calculateScale(olMap.getView().getZoom()),
                  scale: UtilFunc.calculateScaleText(olMap.getView().getZoom()),
                })
              }))
            }
            return style
          }
          default:
            break;
        }
      },
      showVertiport: (vertiports, isCenter, isRemove) => {
        const { olMap, actions: {getLayer, layerStyleFunc, addLayer, } } = get();
        let features = [];
        let vertiportLayer = getLayer('vertiportLayer');
        let vertiportSource = vertiportLayer?.getSource();
        if(!vertiportLayer){
          vertiportSource = new VectorSource({
            features: features
          });
          vertiportLayer = new VectorLayer({
            source: vertiportSource,
            zIndex: 3,
            style: (feature) => layerStyleFunc('vertiportLayer', feature)
          })
          addLayer('vertiportLayer', vertiportLayer);
        }
        if(isRemove) vertiportSource.clear();
        if(vertiports.length > 0) {
          vertiports.forEach((ind) => {
            let vertiport = vertiportSource.getFeatureById(ind.id);
            if(!vertiport){
                let coord = transform([ind.lon, ind.lat], 'EPSG:4326', 'EPSG:5179')
                let newPoint = new Point(coord)
                let feature = new Feature({
                  geometry: newPoint,
                  id: ind.id,
                  nm: ind.name,
                  status: ind.status,
                  group: 'vertiport'
                })
                feature.setId(ind.id)
                features.push(feature)
            }else{
              vertiportSource.removeFeature(vertiport);
              features.push(vertiport)
            }
          })
        }
        if(features.length>0) {
          vertiportSource.addFeatures(features); // 새로운 데이터 추가
        }
        if(isCenter){
          olMap.getView().fit(vertiportSource.getExtent(),{
            padding: [50, 50, 50, 50] // [top, right, bottom, left]
          });
        }
      },
      hideCorridors: (type, corridors) => {
        const corridorStoreState = useCorridorStore.getState(); // zustand의 상태 가져오기
        const { lines, actions: {getLayer}} = get();
        let corridorLayer = getLayer('corridorLayer');
        let corridorSource = corridorLayer?.getSource();
        let corridorDashLayer = getLayer('corridorDashLayer');
        let corridorDashSource = corridorDashLayer?.getSource();
        let waypointLayer = getLayer('waypointLayer');
        let waypointSource = waypointLayer?.getSource();
        if(type=="mySector"){
          if(corridorLayer) {
            corridorSource.clear();
          }
          if(corridorDashLayer) {
            corridorDashSource.getFeatures().forEach(ind=>{
              if(!ind.get("selected")) corridorDashSource.removeFeature(ind);
            })
          }
          if(waypointLayer) {
            waypointSource.clear();
          }
        }else{
          if(corridors){
            corridorSource.getFeatures().forEach(ind=>{
              corridors.map((jnd)=>{
                if("cdPolygon_"+jnd.corridorCode == ind.getId()){
                  delete lines.corridor[jnd.corridorCode];
                  corridorSource.removeFeature(ind);
                }
              });
            })
            corridorDashSource.getFeatures().forEach(ind=>{
              corridors.map((jnd)=>{
                if("corridorText_"+jnd.corridorCode == ind.getId()){
                  delete lines.corridorText[jnd.corridorCode];
                  corridorDashSource.removeFeature(ind);
                }else if(ind.getId().startsWith("corridor_Center_"+jnd.corridorCode)){
                  delete lines.corridorCenter[ind.getId().replace("corridor_Center_","")];
                  corridorDashSource.removeFeature(ind);
                }
              });
            })
    
            let arrWP = []; // 이미 그려져 있는 waypoints
            Object.keys(lines.corridor).forEach(ind=>{
              corridorStoreState.corridorList.find(jnd=>jnd.corridorCode==ind).corridorDetail.map(jnd=>{
                arrWP.push(jnd.waypointCode)
              })
            })
            waypointLayer?.getSource().getFeatures().forEach(ind=>{
              if(!arrWP.includes(ind.getId())){ // 이미 그려져 있는 waypoints 에 없는 포인트는 삭제
                waypointSource.removeFeature(ind)
              }
            })
          }else{
            if(corridorLayer) {
              corridorSource.clear();
            }
            if(corridorDashLayer) {
              corridorDashSource.clear();
            }
            if(waypointLayer) {
              waypointSource.clear();
            }
          }
        }
      },
      hideVertiports: () => {
        const { actions: { getLayer } } = get();
        let vertiportLayer = getLayer('vertiportLayer');
        let vertiportSource = vertiportLayer?.getSource();
        if(vertiportLayer && vertiportSource) vertiportSource.clear();
      }
    },
  };
})

export default useMapStore;
