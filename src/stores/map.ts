import { create } from "zustand";
// import { flushSync } from 'react-dom';
import dayjs from 'dayjs';
import proj4 from 'proj4';
// const proj4 = require('proj4');
import {register} from 'ol/proj/proj4.js';
import VectorSource from 'ol/source/Vector.js';
import {Vector as VectorLayer, Layer} from 'ol/layer.js';
import { Cluster } from 'ol/source.js';
import Feature from 'ol/Feature.js'
import { Point, LineString, Polygon } from 'ol/geom'
import {get as getProjection, fromLonLat, transform, toLonLat} from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js'
import {getDistance, getArea, getLength} from 'ol/sphere';
import View from 'ol/View.js'
import LayerTile from 'ol/layer/Tile.js'
// import XYZ from 'ol/source/XYZ';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
// import TileImage from 'ol/source/TileImage.js';
import WMTS from 'ol/source/WMTS.js';
import { getTopLeft, getWidth } from 'ol/extent.js';
import { defaults as cDefaults} from 'ol/control.js'
import { defaults as iDefaults, MouseWheelZoom} from 'ol/interaction.js'
import { toSize } from 'ol/size.js'
import MultiPolygon from 'ol/geom/MultiPolygon.js';
import MultiPoint from 'ol/geom/MultiPoint.js';
import {getVectorContext} from 'ol/render.js';
import Draw from 'ol/interaction/Draw.js';
import Modify from 'ol/interaction/Modify.js';
import Collection from 'ol/Collection.js';
import Overlay from 'ol/Overlay.js';
import {unByKey} from 'ol/Observable.js';
import Select from 'ol/interaction/Select.js';
import { click, shiftKeyOnly, singleClick, altKeyOnly } from 'ol/events/condition.js';
// import ol_Overlay_FixedPopup from "ol-ext/overlay/FixedPopup"
import ol_interaction_DragOverlay from "ol-ext/interaction/DragOverlay"
// const ol_interaction_DragOverlay = require('ol-ext/interaction/DragOverlay');
import ol_featureAnimation_Path from "ol-ext/featureanimation/Path"
// import ol_control_Search from "ol-ext/control/Search"
import {linear, easeOut} from 'ol/easing';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import Circle from 'ol/geom/Circle';
import * as turf from '@turf/turf';
// import ScaleLine from 'ol/control/ScaleLine.js';
import { getCenter } from 'ol/extent';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';
import WebGLVectorLayer from 'ol/layer/WebGLVector.js';

import { Fill, Icon, Stroke, Style, Text, Circle as CircleStyle, RegularShape } from 'ol/style.js'
// import IFR_RTK from '@/assets/icon/ic_track_g.svg'
// import IFR_ADSB from '@/assets/icon/ic_track_w_5.svg'
const IFR_RTK = "/assets/icon/ic_track_g.svg"; // 이미지 경로
const IFR_ADSB ='/assets/icon/ic_track_w_5.svg'
const IC_BaseStation = '/assets/icon/ic_antenna_2.svg'
const IC_VP_RED = "/assets/icon/ic_vertiport_red.svg"; // 이미지 경로

const IC_Obstacle = '/assets/icon/ic_obstacle.svg';
import UtilFunc from '../utils/functions';
import apiService from '../api/apiService';
import useCorridorStore from './corridor';
import usePlaybackStore from "./playback";

// const IC_WP = '../assets/icon/waypoint.svg';
const IC_WP = '/assets/icon/waypoint.svg';
const IC_VP = '/assets/icon/ic_vertiport_grey.svg';


proj4.defs('EPSG:5179', '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs');
register(proj4);
const epsg_5179: any = getProjection('EPSG:5179');
epsg_5179.setExtent([-200000.0, -28024123.62, 31824123.62, 4000000.0]);
const epsg_3857: any = getProjection('EPSG:3857');
const epsg_3857_extent = epsg_3857.getExtent();
const epsg_3857_size = getWidth(epsg_3857_extent) / 256;
const epsg_3857_resolutions = new Array(19);
const epsg_3857_matrixIds = new Array(19);
const epsg_5179_extent = epsg_5179.getExtent();
const epsg_4326: any = getProjection('EPSG:4326');
const epsg_4326_extent = epsg_4326.getExtent();
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  epsg_3857_resolutions[z] = epsg_3857_size / Math.pow(2, z);
  epsg_3857_matrixIds[z] = z;
}

interface MapStore {
  tileNames_en: any,
  styleFunction:  (feature, resolution) => any,
  vectorSource: any,
  vectorLayer: any,
  olMap: any,
  mapMode: any,
  layerGroup: any, // 전체 레이어를 관리할 그룹
  rightTools: any,
  lines: any,
  myCorridor: any, // 내가 관리하는 회랑
  hideStyle: any,
  dragOverlay: any,
  nowZoom: any,
  mapRotation: any,

  mapEvent: () => void,
  initMap: (map) => void,
  transformCoords: (coords, sourceProj, targetProj) => void,
  drawCorridors: (corridors, group, isCenter) => void,
  hideCorridors: (type?:any, corridors?:any) => void,
  showVertiport: (vertiports?:any, isCenter?:any, isRemove?:any) => void,
  hideVertiport: (arr?:any) => void,
  showWaypoint: (arr) => void,
  addLayer: (name, layer) => void,
  getLayer: (name) => void,
  layerStyleFunc: (name, feature) => void,
  clearMap: () => void,
  drawFato: (lat, lon, code, index) => void,
  drawStand: (lat, lon, code, index) => void,
  addFeaturePoint2: (list) => void,
  selectVertiport: (id) => void,
  unSelectVertiport: (id) => void,
  setMode: (mode) => void,
  toggleRightTools: (type) => void,
  addFeaturePoint: (list) => void,
  checkZoom: () => void
}

const useMapStore = create<MapStore>((set, get) => ({
  
  tileNames_en:  [
    "satellite_map",
    "white_map",
    "night_map",
    "korean_map",
  ],
  styleFunction:  (feature, resolution) => {
    let styles = {
      Vertiport: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: [255, 51, 204, 0.5] }),
          stroke: new Stroke({
            color: [255, 51, 204, 1],
            width: 3,
          }),
        }),
        text: new Text({
          text: 'id : ' + feature.get('id') + '\nname : ' + feature.get('nm'),
          font: 'bold 15px Calibri,sans-serif',
          fill: new Fill({
            color: 'black',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
          offsetY: -40,
          backgroundFill: new Fill({
            color: 'rgba(255, 165, 0, 0.8)', // 배경색 (주황색)
          }),
          padding: [5, 5, 5, 5], // 텍스트와 배경 사이의 여백
        }),
      }),
      FATO: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: [51, 51, 204, 0.5] }),
          stroke: new Stroke({
            color: [51, 51, 204, 1],
            width: 3,
          }),

        }),
        text: new Text({
          text: 'code : ' + feature.get('code'),
          font: 'bold 15px Calibri,sans-serif',
          fill: new Fill({
            color: 'black',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
          offsetY: -30,
          backgroundFill: new Fill({
            color: 'rgba(255, 165, 0, 0.8)', // 배경색 (주황색)
          }),
          padding: [5, 5, 5, 5], // 텍스트와 배경 사이의 여백
        }),
      }),
      STAND: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: [204, 0, 255, 0.5] }),
          stroke: new Stroke({
            color: [204, 0, 255, 1],
            width: 3,
          }),

        }),
        text: new Text({
          text: 'code : ' + feature.get('code'),
          font: 'bold 15px Calibri,sans-serif',
          fill: new Fill({
            color: 'black',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
          offsetY: -30,
          backgroundFill: new Fill({
            color: 'rgba(255, 165, 0, 0.8)', // 배경색 (주황색)
          }),
          padding: [5, 5, 5, 5], // 텍스트와 배경 사이의 여백
        }),
      }),
      VertiportOn: new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({ color: [255, 0, 0, 0.5] }),
          stroke: new Stroke({
            color: [255, 0, 0, 1],
            width: 3,
          }),
        }),
        text: new Text({
          text: 'id : ' + feature.get('id') + '\nname : ' + feature.get('nm'),
          font: 'bold 15px Calibri,sans-serif',
          fill: new Fill({
            color: 'black',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
          offsetY: -40,
          backgroundFill: new Fill({
            color: 'rgba(255, 165, 0, 0.8)', // 배경색 (주황색)
          }),
          padding: [5, 5, 5, 5], // 텍스트와 배경 사이의 여백
        }),
      }),
    }
    return styles[feature.getProperties().type]
  },
  vectorSource:  (new VectorSource({features: []})),
  vectorLayer: null,
  olMap: null,
  mapMode:  (0),
  layerGroup:  ({}), // 전체 레이어를 관리할 그룹
  rightTools:  ({
    map : false,
    removeSector : false
  }),
  lines:  {sid:{}, corridor:{}, corridorCenter:{}, star:{}, mine:{}, mineunion:{}, corridorText: {}},
  myCorridor:  {}, // 내가 관리하는 회랑
  hideStyle:  [
    new Style({
      stroke: new Stroke({
        color: `rgba(0,0,0,0)`,
        width: 0,
      }),
      fill: new Fill({ color: `rgba(0,0,0,0)` }),
    }),
  ],
  dragOverlay: null,
  nowZoom: 0,
  mapRotation: 0,
  checkZoom: () => {
    if (get().olMap) {
      set((state) => ({ nowZoom: state.olMap.getView().getZoom() }));
    } else {
      console.log('olMap 없을 때 checkZoom..'); // olMap이 없을 경우 로그 출력
    }
  },
  mapEvent:  () => {
    const { wsDroneMarker, wsDroneLabel, wsLabelLine } = usePlaybackStore.getState();

    // [1] 마우스 오버
    get().olMap.on('pointermove', function (e) {
      get().olMap.getTarget().style.cursor = 'default'; // 기본 커서 설정
      const pixel = get().olMap.getEventPixel(e.originalEvent);
      // 관제 배정 관리에서 회랑 중심선 커서 변경
      get().olMap.forEachFeatureAtPixel(pixel, function (feature:any) {
        if (feature.get('group') === 'mySector') {
          get().olMap.getTarget().style.cursor = 'pointer';
          return true; // 루프 중지
        }
      });
    });

    // [2] 마우스 클릭
    get().olMap.getViewport().addEventListener('mousedown', function (e) {
      get().olMap.forEachFeatureAtPixel(get().olMap.getEventPixel(e), function (feature, layer) {
        if(feature){
          if(feature.getGeometry().getType()==="LineString" && feature.getId()?.startsWith('corridor_Center_') && feature.get('group')){
            if(feature.get('selected')){
              if(useCorridorStore.getState().corridorDetail === feature.get('corridor')){
                feature.set('selected', false)
                feature.setStyle(feature.get("st"))
              }else{
                let corridorDashLayer: any = get().getLayer('corridorDashLayer');
                let corridorDashSource = corridorDashLayer?.getSource();
                corridorDashSource.removeFeature(feature);
              }
              let start = useCorridorStore.getState().mySector.findIndex((ind:any)=>ind.corridor===feature.get("corridor") && ind.index===feature.get("index"));
              let newArray = [...useCorridorStore.getState().mySector];
              newArray.splice(start, 1);
              useCorridorStore.getState().setmySector(newArray);
            }else{
              let centerStyle = function (feature:any) {
                const styles = [
                  new Style({
                    stroke: new Stroke({
                      color: `rgba(235, 150, 2, 1)`,
                      width: 3,
                      lineDash: [5,10],
                      lineDashOffset: 0
                    }),
                  }),
                ];
                return styles;
              };
              feature.setStyle(centerStyle)
              feature.set('selected', true)
              useCorridorStore.getState().setmySector([...useCorridorStore.getState().mySector, {index:feature.get("index"), corridor:feature.get("corridor"), prev:feature.get("prev"), next:feature.get("next")}]);
              useCorridorStore.getState().sortMySector((a, b) => {
                if (a.corridor === b.corridor) {
                  return a.index - b.index; // corridor이 같을 때는 index로 오름차순
                }
                return a.corridor.localeCompare(b.corridor);
              });
            }
          }
        }
      });
    });

    // [4] label 드래그 이벤트
    get().dragOverlay.on('dragstart', function (e) {
      let overlayGroup = e.overlay.getElement().classList[0];
      if (overlayGroup == 'drone_label') {
        console.log(e.overlay.getId(), wsDroneLabel[e.overlay.getId()]);
        wsDroneLabel[e.overlay.getId()].isDragging = true;
        wsDroneMarker[e.overlay.getId()].isTarget = false;
      }
    })
    get().dragOverlay.on('dragging', function (e) {
      let overlayGroup = e.overlay.getElement().classList[0];
      /* eslint-disable no-empty */
      if (overlayGroup == 'drone_label') {
        let drone = wsDroneMarker[e.overlay.getId()].getGeometry().getCoordinates();
        wsLabelLine[e.overlay.getId()].getGeometry().setCoordinates([drone, e.coordinate]);
      } else if (overlayGroup == 'ol-DST' || overlayGroup == 'ol-DST-last') {
        let linePoint = e.overlay.get('measureLine').getGeometry().getCoordinates()[0];
        e.overlay.get('measureLine').getGeometry().setCoordinates([linePoint, e.coordinate]);
      }
    });
    get().dragOverlay.on('dragend', function (e) {
      let overlayGroup = e.overlay.getElement().classList[0];
      if (overlayGroup == 'drone_label') {
        let drone = wsDroneMarker[e.overlay.getId()].getGeometry().getCoordinates();
        let sPixel = get().olMap.getPixelFromCoordinate(drone);
        let ePixel = get().olMap.getPixelFromCoordinate(e.coordinate);
        let x = ePixel[0] - sPixel[0];
        let y = ePixel[1] - sPixel[1];
        wsDroneLabel[e.overlay.getId()].set('x', x)
        wsDroneLabel[e.overlay.getId()].set('y', y)
        wsLabelLine[e.overlay.getId()].getGeometry().setCoordinates([drone, e.coordinate]);
        wsDroneLabel[e.overlay.getId()].isDragging = false;
      }
    });
  },
  initMap: async(map) => {
		get().layerGroup = {}; // Layer 초기화
    set({ vectorLayer:  (new VectorLayer({
        source: get().vectorSource,
        zIndex: 3,
        style: (feature: any, resolution) => {
          let styles = {
            MultiPolygon: new Style({
              stroke: new Stroke({
                color: 'blue',
                width: 5,
              }),
            }),
          }
          return styles[feature.getGeometry().getType()]
        },
        updateWhileAnimating: true,
        updateWhileInteracting: true,
      })),
    })
    let initCenter = transform([126.713, 37.555], 'EPSG:4326', 'EPSG:5179');
    let initZoom = 11;
    let initMinZoom = 5;
    let initMaxZoom = 18;
    let wmtEmapOption = {
      url : "//map.ngii.go.kr/openapi/Gettile.do?apikey=9FDC4C793C40A600159CF4B5E8BC5748",
      matrixSet : "EPSG:5179",
      format : "image/png",
      projection : epsg_5179,
      tileGrid : new WMTSTileGrid({
        origin : getTopLeft(epsg_5179.getExtent()),
        resolutions : [2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28, 32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255],
        matrixIds : ["L05","L06","L07","L08","L09","L10","L11","L12","L13","L14","L15","L16","L17","L18"]
      }),
      style : 'korean',
      wrapX : true,
      attributions:[
        '<img style="width:96px; height:16px;"src="http://map.ngii.go.kr/img/process/ms/map/common/img_btoLogo3.png" alt="로고">'
      ],
      crossOrigin : 'anonymous'
    };

    for (var i =0; i<get().tileNames_en.length;i++){
      get().layerGroup[get().tileNames_en[i]] = new LayerTile({
        visible: false
      });
    }
    get().layerGroup['default'] = get().vectorLayer;

    get().olMap = new Map({
      layers : [get().vectorLayer],
      target: map,
      view: new View({
        projection: 'EPSG:5179',
        center:initCenter,
        // projection: 'EPSG:3857',
        // center:test,
        // projection: 'EPSG:4326',
        // center: [127.81971330907018, 36.89],
        zoom: initZoom,
        maxZoom:initMaxZoom,
        minZoom:initMinZoom,
        // extent:epsg_4326_extent,
        // maxResolution: 2088.96,
        minResolution: 0.255,
        constrainResolution: false // 줌 레벨이 정수 단위로 고정되지 않고, 자연스럽게 부드러운 확대/축소가 가능
      }),
      // interactions: iDefaults({mouseWheelZoom: false}).extend([
      //   new MouseWheelZoom({
      //     constrainResolution: true
      //   })
      // ]),
      // controls: cDefaults({
      //   attributionOptions: {
      //     collapsible: false
      //   }
      // }),
      // logo:false
      controls: [],
    });
    for (var i =0; i<get().tileNames_en.length;i++){
      get().layerGroup[get().tileNames_en[i]].setSource(new WMTS(Object.assign(
        {},
        wmtEmapOption,
        {name:get().tileNames_en[i],layer:get().tileNames_en[i]}
      )));
      get().addLayer(get().tileNames_en[i], get().layerGroup[get().tileNames_en[i]])
    }

    // dim 처리할 폴리곤 영역 설정
    let worldPolygonCoords: any = get().transformCoords([[
      [124.0, 33.0],  // 서해 남부 해상
      [131.0, 33.0],  // 남해 동쪽 해상
      [131.0, 43.0],  // 동해 북쪽 끝
      [124.0, 43.0],  // 서해 북쪽 끝
      [124.0, 33.0]   // 다시 서해 남부 해상으로 연결
    ]], 'EPSG:4326', 'EPSG:5179');
    let worldPolygon = new Polygon(worldPolygonCoords);
    let worldPolygonFeature = new Feature({geometry: worldPolygon, group:'dim'});
    let dimStyle = new Style({
      fill: new Fill({
        color: 'rgba(16, 24, 40, 0.6)',
      }),
    });
    let dimSource = new VectorSource({
      features: [worldPolygonFeature]
    });
    let dimLayer: any = new VectorLayer({
      source: dimSource,
      zIndex: 3,
      style: dimStyle
    })
    get().addLayer('dimLayer', dimLayer)

    get().layerGroup[get().tileNames_en[0]].setVisible(true);

    // dragOverlay 설정
    set((state) => {
      const overlay = new ol_interaction_DragOverlay({ 
        overlays: [],
        centerOnClick: false,});
      state.olMap.addInteraction(overlay); // 상태 참조 후 즉시 작업 수행
      return { dragOverlay: overlay }; // 상태 업데이트
    });

    get().olMap.on('moveend', get().checkZoom)

    get().mapEvent();
  },
  transformCoords: (coords, sourceProj, targetProj) => {
    return coords.map(ring => ring.map(coord => transform(coord, sourceProj, targetProj)));
  },
  drawCorridors: async(corridors, group, isCenter) => {
    let features: any = [];
    let dashs: any = [];
    let corridorLayer: any = get().getLayer('corridorLayer');
    let corridorSource = corridorLayer?.getSource();
    let corridorDashLayer: any = get().getLayer('corridorDashLayer');
    let corridorDashSource = corridorDashLayer?.getSource();
    let baseColor = "70, 73, 81"; // 관리하지 않는 회랑 // UtilFunc.getRandomColor();
    let centerStyle = function (feature:any) {
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
    let showArr = [...useCorridorStore.getState().corridorTypes];
    if(!corridorLayer){
      const defaultStyle = {
        'fill-color': ['get', 'fillColor'],
        'stroke-color': ['get', 'strokeColor'],
        'stroke-width': ['get', 'strokeWidth'],
        'point-size' :  ['get', 'pointSize'],
      };
      class WebGLLayer extends VectorLayer {
        constructor(options:any) {
          super(options);
          (this as any).currentStyle = options.style || defaultStyle;
        }
        createRenderer(): any {
          return new WebGLVectorLayerRenderer(this, {
            style: (this as any).currentStyle,
          } as any);
        }
        setStyle(newStyle:any) {
          if(newStyle){
            (this as any).currentStyle = newStyle;
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
      get().addLayer('corridorLayer', corridorLayer);
    }
    if(!corridorDashLayer){
      corridorDashSource = new VectorSource({
        features: dashs
      });
      corridorDashLayer = new VectorLayer({
        source: corridorDashSource,
        zIndex: 3,
      });
      get().addLayer('corridorDashLayer', corridorDashLayer);
    }
    corridors.forEach(async(corridor) => {
      let arrCorridor = corridor.corridorDetail;
      let arrPolygon = corridor.corridorPolygon;
      // console.log("corridor", corridor)
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
        arrPolygon?.map((ind: any) => {
          let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:5179'
          });
          jsonfeatures.forEach((feature:any) => {
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
            get().lines.corridor[corridor.corridorCode] = feature;
            features.push(feature);
          });
        })
      }
      // [2] Sid, Star
      corridor.corridorSidStar?.map((ind:any)=>{
        let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:5179'
        });
        jsonfeatures.forEach(feature => {
          if(ind.sidStar==="sid"){
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
          get().lines[ind.sidStar][corridor.corridorCode] = feature;
          features.push(feature);
        });
      })
      // [3] my corridor
      arrCorridor.map((item,i)=>{ // 그리려는 회랑과 내가 관리하는 회랑이 일치하면 lines.mine에 저장
        if(i<arrCorridor.length-1){
          let comp1 = item.waypointCode + arrCorridor[i+1].waypointCode;
          get().myCorridor.userPolygon?.map((ind:any)=>{
            let linkId = ind.linkId;
            if(!get().lines.mine[linkId]){
              if(comp1===linkId){
                let jsonfeatures = new GeoJSON().readFeatures(ind.stBuffer.value, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: 'EPSG:5179'
                });
                jsonfeatures.forEach(feature => {
                  get().lines.mine[linkId] = feature;
                });
              }
            }
          })
        }
      });
      let mypolygons:any = [];
      Object.keys(get().lines.mine).forEach((ind:any)=>{
        let f = corridor.corridorLinkPolygon?.find(jnd=>jnd.linkId===ind)
        if(f){
          // let coords = get().transformCoords(get().lines.mine[ind].getGeometry().getCoordinates(), 'EPSG:5179', 'EPSG:4326');
          // mypolygons.push(turf.polygon(coords));
          // let transformedPolygonCoords = transformCoords(coords, 'EPSG:4326', 'EPSG:5179');
          // let intersectPolygon = new Polygon(transformedPolygonCoords);
          // let intersectFeature = new Feature(intersectPolygon);
          // intersectFeature.set('fillColor', `rgba(93, 147, 255, 0.3)`)
          // intersectFeature.set('strokeColor', `rgba(93, 147, 255, 1)`)
          // intersectFeature.set('strokeWidth', 1)
          // features.push(intersectFeature)
        }
      })
      if(mypolygons.length > 1) {
        // let union = turf.union(turf.featureCollection(mypolygons));
        // union.geometry.coordinates.forEach((ind,i)=>{
        //   let my_id = Object.keys(lines.mineunion).length;
        //   let transformedPolygonCoords = transformCoords(ind, 'EPSG:4326', 'EPSG:5179');
        //   let intersectPolygon = new Polygon(transformedPolygonCoords);
        //   let intersectFeature = new Feature(intersectPolygon);
        // if(showArr.includes('width')){ // show 폭
        //   intersectFeature.set('fillColor', `rgba(93, 147, 255, 0.3)`)
        //   intersectFeature.set('strokeColor', `rgba(93, 147, 255, 1)`)
        //   intersectFeature.set('strokeWidth', 1)
        // }else{ // hide
        //   intersectFeature.set('fillColor','rgba(0, 0, 0, 0)')
        //   intersectFeature.set('strokeColor','rgba(0, 0, 0, 0)')
        //   intersectFeature.set('strokeWidth',0)
        // }
        //   intersectFeature.setId(corridor.corridorCode+"_myCorridor_"+my_id)
        //   lines.mineunion[corridor.corridorCode+"_myCorridor_"+my_id] = intersectFeature;
        //   features.push(intersectFeature)
        // })
      }else{
        // let jsonfeatures = new GeoJSON().readFeatures(turf.featureCollection(mypolygons), {
        //   dataProjection: 'EPSG:4326',
        //   featureProjection: 'EPSG:5179'
        // });
        // let my_id = Object.keys(lines.mineunion).length;
        // jsonfeatures.forEach(feature => {
          // if(showArr.includes('width')){ // show 폭
        //   feature.set('fillColor', `rgba(93, 147, 255, 0.3)`)
        //   feature.set('strokeColor', `rgba(93, 147, 255, 1)`)
        //   feature.set('strokeWidth', 1)
          // }else{
        //   feature.set('fillColor', `rgba(0,0,0,0)`)
        //   feature.set('strokeColor', `rgba(0,0,0,0)`)
        //   feature.set('strokeWidth', 0)
          // }
        //   feature.setId(corridor.corridorCode+"_myCorridor_"+my_id)
        //   lines.mineunion[corridor.corridorCode+"_myCorridor_"+my_id] = feature;
        //   features.push(feature);
        // });
      }
      // [4] Center Line
      for(var i=0; i<arrCorridor.length-1; i++){
        if(corridorDashSource.getFeatureById('corridor_Center_' + corridor.corridorCode + "_" + i)){
          let segmentLine = corridorDashSource.getFeatureById('corridor_Center_' + corridor.corridorCode + "_" + i);
          if(showArr.includes('center')){ // show 중심선
            segmentLine.setStyle(centerStyle)
          }else{ // hide
            segmentLine.setStyle(get().hideStyle);
          }
        }else{
          let prev = transform([arrCorridor[i].waypointLon, arrCorridor[i].waypointLat], 'EPSG:4326', 'EPSG:5179')
          let next = transform([arrCorridor[i+1].waypointLon, arrCorridor[i+1].waypointLat], 'EPSG:4326', 'EPSG:5179')
          let segmentLine:any = new Feature({geometry: new LineString([prev,next]), type:"Ani"});
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
            segmentLine.setStyle(get().hideStyle);
            segmentLine.set('st', get().hideStyle)
          }
          segmentLine.setId('corridor_Center_' + corridor.corridorCode + "_" + i)
          get().lines.corridorCenter[corridor.corridorCode + '_' + i] = segmentLine;
          dashs.push(segmentLine)
        }
      }
      // [5] waypoints
      let waypoints = arrCorridor.filter(item=>item.pointType==='waypoint').map((item,i)=>{
        return {
          styleType: "Waypoint", id:item.waypointCode, name: item.waypointCode,
          lon: item.waypointLon, lat: item.waypointLat}
      });
      get().addFeaturePoint(waypoints)
      // [6] vertiports
      let vertiports = arrCorridor.filter(item=>item.pointType==='vertiport').map((item,i)=>{
        return {id:item.waypointCode, lon:item.waypointLon, lat:item.waypointLat}
      })
      // console.log("[drawCorridors] selectedVertiports", cloneDeep(selectedVertiports))
      get().showVertiport(vertiports)
    })
    if(features.length>0) {
      corridorSource.addFeatures(features); // 새로운 데이터 추가
    }
    if(dashs.length>0) {
      corridorDashSource.addFeatures(dashs); // 새로운 데이터 추가
    }
    if(isCenter && corridorDashSource){
      get().olMap.getView().fit(corridorDashSource.getExtent(),{
        padding: [50, 50, 50, 50] // [top, right, bottom, left]
      });
    }
  },
  hideCorridors: (type?:any, corridors?:any) => {
    let corridorLayer: any = get().getLayer('corridorLayer');
    let corridorSource = corridorLayer?.getSource();
    let corridorDashLayer: any = get().getLayer('corridorDashLayer');
    let corridorDashSource = corridorDashLayer?.getSource();
    let waypointLayer: any = get().getLayer('waypointLayer');
    let waypointSource = waypointLayer?.getSource();
    if(type==="mySector"){
      if(corridorLayer) {
        corridorSource.clear();
      }
      if(corridorDashLayer) {
        corridorDashSource.getFeatures().forEach((ind:any)=>{
          if(!ind.get("selected")) corridorDashSource.removeFeature(ind);
        })
      }
      if(waypointLayer) {
        waypointSource.clear();
      }
    }else{
      if(corridors){
        corridorSource.getFeatures().forEach((ind:any)=>{
          corridors.map((jnd)=>{
            if("cdPolygon_"+jnd.corridorCode === ind.getId()){
              delete get().lines.corridor[jnd.corridorCode];
              corridorSource.removeFeature(ind);
            }
          });
        })
        corridorDashSource.getFeatures().forEach((ind:any)=>{
          corridors.map((jnd)=>{
            if("corridorText_"+jnd.corridorCode === ind.getId()){
              delete get().lines.corridorText[jnd.corridorCode];
              corridorDashSource.removeFeature(ind);
            }else if(ind.getId().startsWith("corridor_Center_"+jnd.corridorCode)){
              delete get().lines.corridorCenter[ind.getId().replace("corridor_Center_","")];
              corridorDashSource.removeFeature(ind);
            }
          });
        })

        let arrWP:any = []; // 이미 그려져 있는 waypoints
        Object.keys(get().lines.corridor).forEach((ind:any)=>{
          useCorridorStore.getState().corridorList.find(jnd=>jnd.corridorCode===ind).corridorDetail.map(jnd=>{
            arrWP.push(jnd.waypointCode)
          })
        })
        waypointLayer?.getSource().getFeatures().forEach((ind:any)=>{
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
  showVertiport: (vertiports?:any, isCenter?:any, isRemove?:any) => {
    let features:any = [];
    let vertiportLayer: any = get().getLayer('vertiportLayer');
    let vertiportSource = vertiportLayer?.getSource();
    if(!vertiportLayer){
      vertiportSource = new VectorSource({
        features: features
      });
      vertiportLayer = new VectorLayer({
        source: vertiportSource,
        zIndex: 3,
        style: (feature) => get().layerStyleFunc('vertiportLayer', feature)
      })
      get().addLayer('vertiportLayer', vertiportLayer);
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
      get().olMap.getView().fit(vertiportSource.getExtent(),{
        padding: [50, 50, 50, 50] // [top, right, bottom, left]
      });
    }
  },
  hideVertiport: (arr?:any) => {
    let vertiportLayer: any = get().getLayer('vertiportLayer');
    let vertiportSource = vertiportLayer?.getSource();
    if(arr) {
      if(vertiportLayer) {
        let vertiportSource = vertiportLayer.getSource();
        arr.map((ind:any)=>{
          vertiportSource.removeFeature(vertiportSource.getFeatureById(ind.id));
        })
      }
    }else{
      if(vertiportLayer) {
        vertiportSource.clear();
      }
    }
  },
  showWaypoint: (arr) => {
    let waypointLayer: any = get().getLayer('waypointLayer');
    let waypointSource = waypointLayer?.getSource();
    let corridorDashLayer: any = get().getLayer('corridorDashLayer');
    let corridorDashSource = corridorDashLayer?.getSource();
    let centerStyle = function (feature:any) {
      const styles = [
        new Style({
          stroke: new Stroke({
            color: `rgba(93, 147, 255, 1)`,
            width: 2,
            lineDash: [5,10],
            lineDashOffset: 0
          }),
        }),
      ];
      return styles;
    };

    if(!waypointLayer) {
      waypointSource = new VectorSource({
        features: [],
      });
      waypointLayer = new VectorLayer({
        source: waypointSource,
        zIndex: 3,
        style: (feature) => get().layerStyleFunc('waypointLayer', feature)
      });
      get().addLayer('waypointLayer', waypointLayer);
    } else {
      waypointSource.clear();
    }

    if(!corridorDashLayer){
      corridorDashSource = new VectorSource({
        features: []
      });
      corridorDashLayer = new VectorLayer({
        source: corridorDashSource,
        zIndex: 3,
      });
      get().addLayer('corridorDashLayer', corridorDashLayer);
    } else {
      corridorDashSource.clear();
    }

    //1. 중심라인 그리기
    for(var i=0; i<arr.length-1; i++){
      let prev = transform([arr[i].waypointLon, arr[i].waypointLat], 'EPSG:4326', 'EPSG:5179')
      let next = transform([arr[i+1].waypointLon, arr[i+1].waypointLat], 'EPSG:4326', 'EPSG:5179')
      let segmentLine = new Feature({geometry: new LineString([prev,next]), type:"Ani"});
      segmentLine.setStyle(centerStyle)
      segmentLine.setId('Center_' + arr[i].waypointCode + '_' + arr[i+1].waypointCode)
      corridorDashSource.addFeature(segmentLine); // 새로운 데이터 추가
    }

    //2. waypoint 그리기
    let waypoints = arr.map((item,i)=>{
      return {
        styleType: item.pointType, id:item.waypointCode, name: item.waypointCode,
        lon: item.waypointLon, lat: item.waypointLat}
    });
    waypoints.map((ind:any)=>{
      let newPoint = new Point(transform([ind.lon, ind.lat], 'EPSG:4326', 'EPSG:5179'));
      let options: any = { geometry: newPoint, type: ind.styleType};
      if(ind.id) options.id = ind.id;
      if(ind.name) options.nm = ind.name;
      let feature = new Feature(options)
      waypointSource.addFeature(feature);
    })
  },
  addLayer: (name, layer) => {
    get().layerGroup[name] = layer;
    get().olMap.addLayer(layer);
  },
  getLayer: (name) => {
    return get().layerGroup[name];
  },
  layerStyleFunc: (name, feature) => {
    // Cluster는 여러 개의 개별 피처를 하나의 클러스터로 그룹화합니다.
    // Cluster를 사용하면, 클러스터에 포함된 개별 피처들을 get('features')를 통해 배열로 가져올 수 있습니다.
    // 그래서 feature.get('features')는 클러스터 내부의 피처 배열을 반환합니다.
    switch (name) {
      case 'vertiportLayer': {
        let img = (feature.get('status') === 'UNAVAILABLE' || feature.get('warning')) ? IC_VP_RED : IC_VP;
        let style = [
          new Style({
            image: new Icon({
              src: img,
              scale: UtilFunc.calculateScale(get().olMap.getView().getZoom()),
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
              offsetY: 24 * UtilFunc.calculateScale(get().olMap.getView().getZoom()),
              scale: UtilFunc.calculateScaleText(get().olMap.getView().getZoom()),
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
              offsetY: 35 * UtilFunc.calculateScale(get().olMap.getView().getZoom()),
              scale: UtilFunc.calculateScaleText(get().olMap.getView().getZoom()),
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
              scale: UtilFunc.calculateScale(get().olMap.getView().getZoom()),
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
              offsetY: 25 * UtilFunc.calculateScale(get().olMap.getView().getZoom()),
              scale: UtilFunc.calculateScaleText(get().olMap.getView().getZoom()),
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
              offsetY: 25 * UtilFunc.calculateScale(get().olMap.getView().getZoom()),
              scale: UtilFunc.calculateScaleText(get().olMap.getView().getZoom()),
            })
          }))
        }
        return style
      }
      default:
        break;
    }
  },
  clearMap: () => {
    get().vectorLayer.getSource().clear();
    const mapElement = get().olMap.getTargetElement();
    mapElement.innerHTML = '';
    get().olMap.setTarget(null);
    get().olMap = null;
  },
  drawFato: (lat, lon, code, index) => {
    get().addFeaturePoint2([{id:'newFato_'+index, code:code, lat:lat, lon:lon, styleType: "FATO"}])
    get().olMap.getView().fit(get().vectorSource.getExtent());
  },
  drawStand: (lat, lon, code, index) => {
    get().addFeaturePoint2([{id:'newStand_'+index, code:code, lat:lat, lon:lon, styleType: "STAND"}])
    get().olMap.getView().fit(get().vectorSource.getExtent());
  },
  addFeaturePoint2: (list) => {
    list.map((ind:any)=>{
      let feature = get().vectorSource.getFeatureById(ind.id);
      let newPoint = new Point(transform([ind.lon, ind.lat], 'EPSG:4326', 'EPSG:5179'));
      if(!feature){
        let options:any = { geometry: newPoint, type: ind.styleType};
        if(ind.id) options.id = ind.id;
        if(ind.name) options.nm = ind.name;
        if(ind.code) options.code = ind.code;
        feature = new Feature(options)
        if(ind.id) feature.setId(ind.id)
        feature.setStyle(get().styleFunction)
        get().vectorSource.addFeature(feature);
      }else{
        if(ind.id) feature.set('id', ind.id)
        if(ind.name) feature.set('nm', ind.name)
        if(ind.code) feature.set('code', ind.code)
        feature.setGeometry(newPoint);
      }
    })
  },
  selectVertiport: (id) => {
    let feature = get().vectorSource.getFeatureById(id);
    get().olMap.getView().setCenter(feature.getGeometry().getCoordinates());
    feature.set('type', "VertiportOn")
    feature.setStyle(get().styleFunction)
    get().vectorSource.addFeature(feature);
  },
  unSelectVertiport: (id) => {
    let feature = get().vectorSource.getFeatureById(id);
    feature.set('type', "Vertiport")
    feature.setStyle(get().styleFunction)
  },
  setMode: (mode) =>{
    get().mapMode = mode;
    for (var i =0; i<get().tileNames_en.length;i++){
      get().layerGroup[get().tileNames_en[i]].setVisible(false);
    }
    get().layerGroup[get().tileNames_en[get().mapMode]].setVisible(true);
    Object.keys(get().layerGroup).forEach( // 지도 바꿨을때 text 안보여서 color 분기
      (name) => {
        if(name !== 'default' && name !== 'dimLayer' && !get().tileNames_en.includes(name)) {
          if(name==="vertiportLayer"){
            get().layerGroup[name].setVisible(false);
            setTimeout(() => {
              get().layerGroup[name].setStyle((feature) => get().layerStyleFunc(name, feature));
              get().layerGroup[name].setVisible(true);
            }, 1);
          }else{
            // console.log("지도별 text 색상 바꿔야함", name)
          }
        }
      }
    )
  },
  toggleRightTools: async(type) => {
    Object.keys(get().rightTools).map(key => {
      if(key === type){
        get().rightTools[key] = !get().rightTools[key];
      }else{
        if(key!=='vertiport' && key!=='corridor' && key!=='notam') {
          get().rightTools[key] = false;
        }
      }
    })
    if(type==="removeSector"){
      let vertiportLayer: any = get().getLayer('vertiportLayer');
      if(vertiportLayer){
        vertiportLayer.getSource().clear();
      }
      get().hideCorridors();
      useCorridorStore.getState().setmySector([]);
      useCorridorStore.getState().setcorridorDetail("");
    }
  },
  addFeaturePoint: (list) => {
    let features: any = [];
    let waypointLayer: any = get().getLayer('waypointLayer');
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
        style: (feature) => get().layerStyleFunc('waypointLayer', feature)
      });
      get().addLayer('waypointLayer', waypointLayer);
      // const textLayer = new VectorLayer({
      //   source: waypointSource,  // 동일한 피처에 텍스트 적용
      //   zIndex: 3,
      //   style: (feature) => layerStyleFunc('waypointLayer', feature)
      // });
      // addLayer('textLayer', textLayer);
    }
    let showArr = [...useCorridorStore.getState().corridorTypes];
    list.map(ind=>{
      let feature = waypointSource?.getFeatureById(ind.id);
      let newPoint = new Point(transform([ind.lon, ind.lat], 'EPSG:4326', 'EPSG:5179'));
      if(!feature){
        if(showArr.includes('waypoint')){
          let options: any = { geometry: newPoint, type: ind.styleType};
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
}))

export default useMapStore;