import { create } from "zustand";
import UtilFunc from "../utils/functions"
import Queue from "../utils/queue"
import useMapStore from "./map";
import useFPLStore from "./FPL"
import useSettingStore from "./setting"
import apiService from "../api/apiService"
import {get as getProjection, fromLonLat, transform, toLonLat} from 'ol/proj.js';
import Feature from 'ol/Feature.js'
import { Point, LineString, Polygon } from 'ol/geom'
import Overlay, { Positioning } from 'ol/Overlay.js';
import { Fill, Icon, Stroke, Style, Text, Circle as CircleStyle, RegularShape } from 'ol/style.js'
import IFR_RTK from '../assets/icon/ic_track_g.svg'
import IFR_ADSB from '../assets/icon/ic_track_w_5.svg'


const designAircrft = {
  border : 1,
  borderRadius: 5,
  acceptColor : '#26C97E', // green
  acceptBack : '#12131666',
  riskColor : '#FF263D', // red
  riskBack: '#00000066',
  enterColor : '#5D93FF', // sky //
  enterBack : '12131666',
  decontrolColor: '#D9D9D9', // white
  decontrolBack : '12131666',
  alertColor : '#FAE351', // yellow
  alertBack : '00000066',
  adsbColor : '#D9D9D9', // white
}

interface Drone {
  type: string;
  callsign: string;
  altitude: number;
  gps_lat: number;
  gps_lon: number;
  [key: string]: any;  // 동적으로 추가되는 속성 처리
}

interface PlaybackStore {
  playback_id: string | null;
  originQueue: Queue<Drone[]>;
  socket: WebSocket | null;
  isWSMsgRequired: boolean;
  wsDroneMarker: Record<string, any>;
  wsDroneLabel: Record<string, any>;
  wsLabelLine: Record<string, any>;
  wsDroneVector: Record<string, any>;
  applyFilter: boolean;
  filteredAltitude: { min: number | null; max: number | null };
  isShowVector: boolean;
  labelOffset: number;
  actions: {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    loadPlayBack: (params: any) => Promise<any>;
    pausePlayBack: (params: any) => Promise<any>;
    stopPlayBack: (params: any) => Promise<any>;
    setIsWSMsgRequired: (value: boolean) => void;
    setWsDroneVector: (value: any) => void;
    styleFunction: (feature: any) => void;
    removeWsDroneData: (id: string) => void; 
    pushWsDroneData: (eachDrone: any) => Promise<any>; 
    createDroneLabel: (fid: string) =>  Promise<any>
    updateDroneLabel: (fid: string) => void;
    changeLabelColor:(id: string, color: string, lineColor: string, background: string, isWarning?: boolean) => void;
    setOriginqueue:  (value: boolean) => void;
  };
}

const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  
    playback_id: null,
    originQueue: new Queue(),
    socket: null,
    isWSMsgRequired: false,
    wsDroneMarker: {},
    wsDroneLabel: {},
    wsLabelLine: {},
    wsDroneVector: {},
    applyFilter: false,
    filteredAltitude: {min:null, max:null},
    isShowVector: false,
    labelOffset: 60,

    actions: {
      connect: async () => {
        const uuid = UtilFunc.generateUUID();
        const newSocket = new WebSocket(`ws://211.189.132.21:7080/ws2?token_id=${uuid}`)
        set({ playback_id: uuid });
        set({ socket: newSocket });

        newSocket.onerror = (error) => {
          console.log("websocket connect error", error);
        }
        newSocket.onopen = () => {
          console.log("[socket] connected");
          newSocket.send(`{"type":"**MONITOR**"}`);
        }
        newSocket.onclose = () => {
          console.log("[socket] disconnected");
          window.location.reload();
        }
        newSocket.onmessage = async (ms) => {
          const { isWSMsgRequired, originQueue, actions: {pushWsDroneData} } = get(); // get 사용

          try {
            if (isWSMsgRequired) {
              let result = JSON.parse(ms.data);
              let type = result.type;

              if (result?.mode && result?.mode == 'dump') {
                result.data.forEach(eachDrone => {
                  eachDrone.type = type;
                  eachDrone.callsign = eachDrone.aircraftIdentification;
                  eachDrone.altitude = eachDrone.currentAltitude
                  eachDrone.gps_lat = Number(eachDrone.currentLatitude);
                  eachDrone.gps_lon = Number(eachDrone.currentLongitude);
                });

                //여기선 큐에 담기만 하자.
                originQueue.enqueue(result.data);
              } else {
                //테스트용. 배열로 올때랑 아닐때 둘 다 처리
                if (Array.isArray(result.data)) {
                  result.data.forEach(eachDrone => {
                    eachDrone.type = type;
                    eachDrone.callsign = eachDrone.aircraftIdentification;
                    eachDrone.altitude = eachDrone.currentAltitude
                    eachDrone.gps_lat = Number(eachDrone.currentLatitude);
                    eachDrone.gps_lon = Number(eachDrone.currentLongitude);
                    pushWsDroneData({ result: eachDrone });
                  });
                } else {
                  result = result.data;
                  result.type = type;
                  result.callsign = result.aircraftIdentification;
                  result.altitude = result.currentAltitude
                  result.gps_lat = Number(result.currentLatitude);
                  result.gps_lon = Number(result.currentLongitude);
                  pushWsDroneData({ result: result });
                }
              }
            }
          } catch (error) {
            console.log("socket JSON parse error", error, ms);
          }
        }
      },
      disconnect: async () => {
        const { socket } = get();
        if (socket) {
          socket.close(); // 연결 종료
          set({ socket: null });
          console.log('WebSocket connection closed');
        }
      },
      loadPlayBack: async (params) => {
        try {
          let res = await apiService.loadPlayBack(params);
          return res;
        } catch (error) {
          console.error(error);
        }
      },
      pausePlayBack: async(params) => {
        try {
          let res = await apiService.pausePlayBack(params);
          return res;
        } catch (error) {
          console.error(error);
        }
      },
      stopPlayBack: async(params) => {
        try {
          let res = await apiService.stopPlayBack(params);
          return res;
        } catch (error) {
          console.error(error);
        }
      },
      setIsWSMsgRequired: (value) => set({ isWSMsgRequired: value }),
      setWsDroneVector: (value) => set({ wsDroneVector: value}),
      styleFunction: (feature) => {
        const { wsDroneMarker } = get();
        const { mapRotation, nowZoom } = useMapStore.getState()
        let fplIdentifier = feature.get('id');
        const heading = wsDroneMarker[fplIdentifier]?.heading || 0; // heading 값이 없으면 기본값 0
        let offsetAngle = (Number(heading) + mapRotation + 180) % 360; // 반대 방향의 각도
        offsetAngle = offsetAngle < 0 ? offsetAngle + 360 : offsetAngle; // 각도를 0 이상으로 조정
        let offsetAngleRad = offsetAngle * Math.PI / 180; // 라디안으로 변환
        let styles = {
          playback: new Style({
            image: new Icon({
              src: IFR_RTK,
              offset: [0, 0],
              scale: UtilFunc.calculateScale(nowZoom),
              rotation: offsetAngleRad,
              opacity: 1
            }),
            // text: new Text({
            //   text: '|',
            //   fill: new Fill({
            //     color: `rgba(255, 179, 255, 1)`,
            //   }),
            //   stroke: new Stroke({
            //     color: `rgba(255, 179, 255, 1)`,
            //     width: 2,
            //   }),
            //   rotateWithView: true,
            //   rotation: UtilFunc.degreesToRadians(heading),
            //   scale: 2,
            //   offsetY:-20,
            // }),
          }),
          adsb2: new Style({
            image: new Icon({
              src: IFR_ADSB,
              offset: [0, 0],
              scale: UtilFunc.calculateScale(nowZoom),
              rotation: offsetAngleRad,
              opacity: 1
            }),
          }),
          flightDisconnect: new Style({
            image: new Icon({
              src: IFR_RTK,
              offset: [0, 0],
              scale: UtilFunc.calculateScale(nowZoom),
              rotation: offsetAngleRad,
              opacity: 1
            }),
            // text: new Text({
            //   text: '|',
            //   fill: new Fill({
            //     color: `rgba(255, 179, 255, 1)`,
            //   }),
            //   stroke: new Stroke({
            //     color: `rgba(255, 179, 255, 1)`,
            //     width: 2,
            //   }),
            //   rotateWithView: true,
            //   rotation: UtilFunc.degreesToRadians(heading),
            //   scale: 2,
            //   offsetY:-20,
            // }),
          }),
          // Line: new Style({
          //   stroke: new Stroke({
          //     color: 'blue',
          //     width: 5,
          //   }),
          // }),
          wsLabelLine: new Style({
            stroke: new Stroke({
              color: feature.get('color'),
              width: feature.get('width'),
            }),
          }),
          wsDroneVector: [new Style({
            stroke: new Stroke({
              color: (wsDroneMarker[fplIdentifier]?.get('type') == 'adsb2') ? designAircrft.adsbColor : designAircrft.acceptColor,
              width: 1,
            }),
          }),
          new Style({
            text: new Text({
              text: '--',
              fill: new Fill({
                color: (wsDroneMarker[fplIdentifier]?.get('type') == 'adsb2') ? designAircrft.adsbColor : designAircrft.acceptColor,
              }),
              stroke: new Stroke({
                color: (wsDroneMarker[fplIdentifier]?.get('type') == 'adsb2') ? designAircrft.adsbColor : designAircrft.acceptColor,
                width: 1,
              }),
              rotation: offsetAngleRad,
            }),
            geometry: new Point(feature.getGeometry().getLastCoordinate()),
          })],
        }
        return styles[feature.getProperties().type]
      },

      removeWsDroneData: (id: string) =>{
        set((state)=> {
          const { olMap, vectorSource, dragOverlay } = useMapStore.getState();
          const { wsDroneMarker, wsLabelLine, wsDroneLabel, wsDroneVector } = state;
  
          const newWsDroneMarker = { ...wsDroneMarker };
          const newWsLabelLine = { ...wsLabelLine };
          const newWsDroneLabel = { ...wsDroneLabel };
          const newWsDroneVector = { ...wsDroneVector };
  
          dragOverlay.removeOverlay(newWsDroneLabel[id]);
          olMap.removeOverlay(olMap.getOverlayById(id));
          newWsDroneMarker[id]?.remainCorridor && vectorSource.removeFeature(newWsDroneMarker[id].remainCorridor);
          newWsDroneMarker[id] && vectorSource.removeFeature(newWsDroneMarker[id]);
          newWsLabelLine[id] && vectorSource.removeFeature(newWsLabelLine[id]);
          newWsDroneVector[id] && vectorSource.removeFeature(newWsDroneVector[id]);
  
          delete newWsDroneMarker[id];
          delete newWsLabelLine[id];
          delete newWsDroneLabel[id];
          delete newWsDroneVector[id];
          console.log('[removeWsDronedata] 1: ', newWsDroneMarker, newWsDroneLabel, newWsLabelLine );
          console.log('[removeWsDronedata] 2:', dragOverlay, olMap.getOverlays());
  
          return { wsDroneMarker: newWsDroneMarker, wsLabelLine: newWsLabelLine, wsDroneLabel: newWsDroneLabel, wsDroneVector: newWsDroneVector };
        })
      },
      pushWsDroneData: async (payload) => {
        const { applyFilter, filteredAltitude, wsDroneMarker, wsDroneLabel, wsLabelLine, isShowVector, actions: {styleFunction, createDroneLabel, updateDroneLabel} }  = get();
        const { olMap, vectorSource, getLayer, mapRotation } = useMapStore.getState();
        const { FPLList } = useFPLStore.getState();
        let flightPlanIdentifier = payload.result.flightPlanIdentifier;
        if(flightPlanIdentifier==undefined) flightPlanIdentifier = "test-identifier";
        if(payload.result.gps_lat == 0 || payload.result.gps_lon == 0 || payload.result.gps_lat >= 360 || payload.result.gps_lon >= 360){
          console.log("촬영드론 실시간 모니터링 좌표 오류");
        }
    
        const newPoint = transform([payload.result.gps_lon, payload.result.gps_lat], 'EPSG:4326', 'EPSG:5179');
        const altitudeInRange = applyFilter
            ? (filteredAltitude.min && Number(payload.result.altitude) >= filteredAltitude.min) && 
              (filteredAltitude.max && Number(payload.result.altitude) <= filteredAltitude.max)
            : true; // applyFilter가 적용되지 않으면 모든 기체 표시
    
        //해당 항적에 관련된 FPL정보
        let FPLInfo = FPLList?.filter(ind=>ind.flightPlanIdentifier==flightPlanIdentifier);
    
        // 고도 필터링 (false -> 삭제)
        if(altitudeInRange){
          if(wsDroneMarker[flightPlanIdentifier] ==undefined) {//드론 아이콘 없을시
            const newDroneMarker = new Feature({
              geometry: new Point(newPoint),
              type: payload.result.type,
              callsign:payload.result.callsign,
              id:flightPlanIdentifier,
              group:'drone',
              altitudeInRange: altitudeInRange
            }) as any;

            newDroneMarker.setStyle(styleFunction)
            newDroneMarker.callsign = payload.result.callsign
            newDroneMarker.heading = payload.result.heading || 0;
            newDroneMarker.altitude = payload.result.altitude;
            newDroneMarker.setId(flightPlanIdentifier);
            newDroneMarker.takeOffTime = payload.result.takeOffTime;
            newDroneMarker.emergency = {}; //비상상황
            newDroneMarker.departureAerodrome = payload.result.departureAerodrome;
            newDroneMarker.destinationAerodrome = payload.result.destinationAerodrome;
            newDroneMarker.aircraftType = payload.result.aircraftType; // 항공기종
            newDroneMarker.verVelocityFPM = payload.result.verVelocityFPM; // 항공기 수직속도(고도강하율)
            newDroneMarker.horVelocityKTS = payload.result.horVelocityKTS; // 항공기 수평속도
            newDroneMarker.cruisingLevel = 0; // 순항고도(비행계획서로 제출한 고도)
            newDroneMarker.indicatedAltitude = 0 // FPL 지시고도
            if(FPLInfo.length > 0) {
              newDroneMarker.submitterInfo = FPLInfo[0].flightPlanSubmitterInfo? FPLInfo[0].flightPlanSubmitterInfo : FPLInfo[0].flightPlanSubmitter; // submitter 정보
              newDroneMarker.cruisingLevel = FPLInfo[0].cruisingLevel;
              newDroneMarker.memo = FPLInfo[0].memo || '';
              newDroneMarker.indicatedAltitude = Number(FPLInfo[0].indicatedAltitude?.split(' ')[0]) || 0; // FPL 지시고도
            }
            vectorSource.addFeature(newDroneMarker);
            set((state) => ({
              wsDroneMarker: {
                ...state.wsDroneMarker,
                [flightPlanIdentifier]: newDroneMarker
              }
            }));
            await createDroneLabel(flightPlanIdentifier);
            // if(isShowVector){
            //   if(wsDroneVector[flightPlanIdentifier]){
            //     //updateDroneVector(flightPlanIdentifier);
            //   }else{
            //     //createDroneVector(flightPlanIdentifier);
            //   }
            // }
    
            // //기체이상 경고 존재시 표출
            // for (let i=warningTemps.length-1; i>= 0; i--) {
            //   if (warningTemps[i].flightPlanIdentifier === flightPlanIdentifier) {
            //     wsDroneMarker[flightPlanIdentifier].emergency = warningTemps[i];
            //     //기체이상일 때만 분석요청버튼 활성화
            //     wsDroneMarker[flightPlanIdentifier].emergency.isAnalyze = true;
    
            //     warningInit(warningTemps[i]); // warningInit 실행
            //     updateLabelWarningText(flightPlanIdentifier, warningTemps[i].warnType, designAircrft.riskColor);
            //     changeLabelColor(flightPlanIdentifier, designAircrft.acceptColor, designAircrft.riskColor, designAircrft.riskBack, true);
    
            //     warningTemps.splice(i, 1);
            //   }
            // }
          }else{
            const updateDroneMarker = wsDroneMarker[flightPlanIdentifier];

            //고도 필터링 업데이트 - 기체, 라벨잇는 선은 Feature
            updateDroneMarker.set('altitudeInRange', altitudeInRange);
            updateDroneMarker.previousAltitude =  updateDroneMarker?.altitude; //직전 고도
            // 드론 마커 위치 업데이트
            updateDroneMarker.setGeometry(new Point(newPoint));
            updateDroneMarker.heading = payload.result.heading || 0;
            updateDroneMarker.altitude = payload.result.altitude;
            updateDroneMarker.verVelocityFPM = payload.result.verVelocityFPM; // 항공기 수직속도(고도강하율)
            updateDroneMarker.horVelocityKTS = payload.result.horVelocityKTS; // 항공기 수평속도
            if(FPLInfo?.length > 0) {
              updateDroneMarker.submitterInfo = FPLInfo[0].flightPlanSubmitterInfo? FPLInfo[0].flightPlanSubmitterInfo : FPLInfo[0].flightPlanSubmitter; // submitter 정보
              updateDroneMarker.memo = FPLInfo[0].memo || '';
              updateDroneMarker.indicatedAltitude = Number(FPLInfo[0].indicatedAltitude?.split(' ')[0]) || 0; // FPL 지시고도
            }
    
            // let warningLayer = getLayer('warningLayer');
            // let warningSource = warningLayer?.getSource();
            // if(warningSource){
            //   warningSource.getFeatures().forEach(feature=>{
            //     // 침범 구역 있을시 라인 업데이트
            //     if(feature.getId()?.startsWith("invasionLine||"+flightPlanIdentifier)){
            //       let dronePoint1 = wsDroneMarker[flightPlanIdentifier]?.getGeometry().getCoordinates();
            //       let invasionFId = feature.getId().split("||")[2];
            //       let invasionFeature = warningSource.getFeatureById("invasion_"+invasionFId)
            //       let closestPoint = invasionFeature?.getGeometry().getClosestPoint(dronePoint1);
            //       let obj = warningList.find(jnd=>jnd.type=="invasion" && jnd.identifier==flightPlanIdentifier && jnd.id==invasionFId && jnd.isView)
            //       if(closestPoint){
            //         let line = new LineString([dronePoint1, closestPoint]);
            //         feature.setGeometry(line);
            //         let convertDistance = UtilFunc.convertKm(getDistance(toLonLat(dronePoint1), toLonLat(closestPoint))/1000);
            //         let showDistancd = convertDistance[storeSetting.measurementLength] + storeSetting.measurementLength;
            //         feature.set('distance', showDistancd)
    
            //         //let cutDistance = obj?.areatype=='etod' ? 2.78 : storeSetting.invasionLimit.distance * 1.852; // 장애물은 1.5NM
            //         // // 침범영역 내/외 체크
            //         // let checkInside = invasionFeature?.getGeometry().intersectsCoordinate(dronePoint1);
            //         // // 침범영역 고도 체크
            //         // let checkHeight =  (wsDroneMarker[flightPlanIdentifier].altitude >= invasionFeature.get('lower') && wsDroneMarker[flightPlanIdentifier].altitude <= invasionFeature.get('upper')) ? true : false;
            //         // // 침범 임계치 체크
            //         // let checkDistance = convertDistance['KM'] <= cutDistance ? true : checkInside;
    
            //         // if(!checkHeight || !checkDistance){
            //         //   removeLineInvasion(false, flightPlanIdentifier, invasionFId);
            //         // } else {
            //           if(obj){
            //             feature.set('areadistance', obj.areadistance);
            //             feature.set('warnLevel', obj.warnLevel);
            //             obj.showDistancd = showDistancd;
            //             let time = UtilFunc.calculateTime(convertDistance['KM'], obj.spd);
            //             obj.showTime = Math.floor((Number(time) * 60 * 60));
            //             if(obj.areadistance==0) obj.showTime = 0;
            //             //라벨문구, 색 관련
            //             if(obj.warnLevel == 'violation') { // [risk]수준일 땐 문구,라벨색 변경
            //               updateLabelWarningText(flightPlanIdentifier, obj?.alert_type || null, designAircrft.riskColor); // 라벨,항적상세 경고문구 업데이트
            //               changeLabelColor(flightPlanIdentifier, designAircrft.acceptColor, designAircrft.riskColor, designAircrft.riskBack, true)
            //             } else { // [alert] 수준일 땐 기존 violation 경고 있는지 체크 후 문구,라벨색 변경
            //               let warningExist = checkWarningExist(flightPlanIdentifier, obj);
            //               if(!warningExist || (warningExist && !warningExist.includes('violation'))) {
            //                 updateLabelWarningText(flightPlanIdentifier, obj?.alert_type || null, designAircrft.alertColor); // 라벨,항적상세 경고문구 업데이트
            //                 changeLabelColor(flightPlanIdentifier, designAircrft.acceptColor, designAircrft.alertColor, designAircrft.alertBack, true)
            //               }
            //             }
            //           }
            //         //}
            //       }
            //     }
            //     // 충돌 라인 업데이트
            //     if(feature.getId()?.startsWith("collisionLine_")) {
            //       let ids = feature?.getId()?.replace("collisionLine_","").split("||")
            //       if(ids.includes(flightPlanIdentifier)) {
            //         if(wsDroneMarker[ids[0]] && wsDroneMarker[ids[1]]) {
            //           let dronePoint1 = wsDroneMarker[ids[0]]?.getGeometry().getCoordinates();
            //           let dronePoint2 = wsDroneMarker[ids[1]]?.getGeometry().getCoordinates();
            //           let lineFeature = warningSource.getFeatureById(feature.getId());
            //           let line = new LineString([dronePoint1, dronePoint2]);
            //           lineFeature?.setGeometry(line);
            //           let convertDistance = UtilFunc.convertKm(getDistance(toLonLat(dronePoint1), toLonLat(dronePoint2))/1000);
            //           let showDistancd = convertDistance[storeSetting.measurementLength] + storeSetting.measurementLength;
            //           lineFeature.set('distance', showDistancd)
    
            //           // 두 항적의 고도차 절대값
            //           let altitudeDifference = Math.abs(wsDroneMarker[ids[0]].altitude - wsDroneMarker[ids[1]].altitude);
            //           let checkDistance = convertDistance['KM'] <= storeSetting.collisionLimit.distance * 1.852 ? true : false;
            //           let checkAltDiff = altitudeDifference <= storeSetting.collisionLimit.altitude ? true : false; // 두 항적간 고도차 임계치 설정값 이내 일 때만 경고
            //           //console.log('[pushwsDronedata] 충돌임계치: ', storeSetting.collisionLimit.distance * 1.852, convertDistance['KM']);
            //           if(!checkDistance || !checkAltDiff){
            //             removeLineCollision(false, ids[0], ids[1])
            //           } else {
            //             let obj = warningList.find(jnd=>jnd.type=="collision" && jnd.target1_identifier==ids[0] && jnd.target2_identifier==ids[1] && jnd.isView);
            //             obj.showDistancd = showDistancd;
            //             //라벨문구, 색 관련
            //             // if(wsDroneMarker[flightPlanIdentifier].callsign=='KAL3') console.log("obj.warnLevel", obj.warnLevel)
            //             feature.set('warnLevel', obj.warnLevel);
            //             if(obj.warnLevel == 'violation') { // [risk]수준일 땐 target1, target2 문구,라벨색 변경
            //               updateLabelWarningText(ids[0], obj.alert_type, designAircrft.riskColor); // 라벨,항적상세 경고문구 업데이트
            //               updateLabelWarningText(ids[1], obj.alert_type, designAircrft.riskColor); // 라벨,항적상세 경고문구 업데이트
            //               changeLabelColor(ids[0], designAircrft.acceptColor, designAircrft.riskColor, designAircrft.riskBack, true)
            //               changeLabelColor(ids[1], designAircrft.acceptColor, designAircrft.riskColor, designAircrft.riskBack, true)
            //             } else { // [alert] 수준일 땐 target1, target2 위험수준 있는 지 확인 후 각자 현재 상태에 맞게 문구,라벨색 변경
            //               let target1_exist = checkWarningExist(ids[0], obj); // target1_idendifier 가 속해있는 경고있는 지 확인
            //               let target2_exist = checkWarningExist(ids[1], obj); // target2_idendifier 가 속해있는 경고있는 지 확인
            //               if(!target1_exist || (target1_exist && !target1_exist.includes('violation'))) {
            //                 updateLabelWarningText(ids[0], obj.alert_type, designAircrft.alertColor);
            //                 changeLabelColor(ids[0], designAircrft.acceptColor, designAircrft.alertColor, designAircrft.alertBack, true)
            //               }
            //               if(!target2_exist || (target2_exist && !target2_exist.includes('violation'))) {
            //                 updateLabelWarningText(ids[1], obj.alert_type, designAircrft.alertColor);
            //                 changeLabelColor(ids[1],  designAircrft.acceptColor, designAircrft.alertColor, designAircrft.alertBack, true)
            //               }
            //             }
            //           }
            //         }
            //       }
            //     }
            //   })
            // }
    
            // wsDroneLine[flightPlanIdentifier].getGeometry().appendCoordinate(newPoint);
            if(!get().wsDroneLabel[flightPlanIdentifier]?.isDragging) {
              const updateDroneLabel = wsDroneLabel[flightPlanIdentifier];
              const pixelDrone = olMap.getPixelFromCoordinate(newPoint);
              const pixelLabel = olMap.getPixelFromCoordinate(updateDroneLabel.getPosition());
              let xOffset = pixelDrone[0] - pixelLabel[0] + updateDroneLabel.get('x');
              let yOffset = pixelDrone[1] - pixelLabel[1] + updateDroneLabel.get('y');
              let adjustedCoord = olMap.getCoordinateFromPixel([pixelLabel[0] + xOffset, pixelLabel[1] + yOffset]);
              let adjustedPixelCoord;
    
              //타겟설정된 드론은 실시간 헤딩각도에 따라 위치계산해줘야 함
              if(get().wsDroneMarker[flightPlanIdentifier].isTarget == true) {
                let multifly = Number(localStorage.getItem('multiply')) || 1;
    
                // 라벨을 드론의 헤딩 방향으로 배치할 거리 (예: 80픽셀)
                const distance = 100;
    
                // 오프셋 각도를 드론의 헤딩 각도에서 180도(반대 방향)로 설정
                let offsetAngle = (Number(updateDroneMarker.heading) + mapRotation + 180) % 360; // 반대 방향의 각도
    
                offsetAngle = offsetAngle < 0 ? offsetAngle + 360 : offsetAngle; // 각도를 0 이상으로 조정
                const offsetAngleRad = offsetAngle * Math.PI / 180; // 라디안으로 변환
    
                // 거리와 각도를 기반으로 오프셋 계산
                const offsetX = multifly  * distance * Math.sin(offsetAngleRad); // X축 방향으로 오프셋
                const offsetY = multifly * distance * Math.cos(offsetAngleRad); // Y축 방향으로 오프셋
    
                // 라벨의 위치를 헤딩에 맞게 조정 (드론의 뒤쪽으로 이동)
                adjustedPixelCoord = [pixelDrone[0] + offsetX, pixelDrone[1] - offsetY]; // Y축 방향 반전
                adjustedCoord = olMap.getCoordinateFromPixel(adjustedPixelCoord);
    
                updateDroneLabel.setPositioning('center-center');
                updateDroneLabel.set('x', offsetX);
                updateDroneLabel.set('y', offsetY);
              }
    
              updateDroneLabel.setPosition(adjustedCoord);
              
              const updateLabelLine = wsLabelLine[flightPlanIdentifier];
              updateLabelLine.getGeometry().setCoordinates([newPoint,adjustedCoord]);

              set((state) => ({
                wsDroneMarker: {
                  ...state.wsDroneMarker,
                  [flightPlanIdentifier]: updateDroneMarker
                },
                wsLabelLine: {
                  ...state.wsLabelLine,
                  [flightPlanIdentifier]: updateLabelLine
                },
                wsDroneLabel: {
                  ...state.wsDroneLabel,
                  [flightPlanIdentifier]: updateDroneLabel
                }
              }));
            }
    
            updateDroneLabel(flightPlanIdentifier); // 라벨 내 데이터 갱신
            // if(isShowVector){
            //   if(wsDroneVector[flightPlanIdentifier]){
            //     updateDroneVector(flightPlanIdentifier);
            //   }else{
            //     createDroneVector(flightPlanIdentifier);
            //   }
            // }
    
            // 항적상세 페이지 오픈 시 남은 루트 그려주기.
            // if(corridorList?.length > 0 && ((isShowAircraftDetail && selectedAirCraft == flightPlanIdentifier) || isDetailFPLView && FPLDetail.flightPlanIdentifier == flightPlanIdentifier)){
            //   let cdObj = corridorList.find(ind=>ind.departure == wsDroneMarker[flightPlanIdentifier].departureAerodrome && ind.destination==wsDroneMarker[flightPlanIdentifier].destinationAerodrome);
            //   let corridorLinkPolygon = cdObj?.corridorLinkPolygon;
            //   // let corridorPolyLine = cdObj?.corridorDetail?.map(jsonPoints=>transform([jsonPoints.waypointLon, jsonPoints.waypointLat], 'EPSG:4326', 'EPSG:5179'))
            //   // let total = 0;
            //   // for(var i=0; i<corridorPolyLine.length-1; i++){
            //     // if(i==0){
            //     //   let jsonfeatures = new GeoJSON().readFeatures(corridorList.find(ind=>ind.corridorCode == cc)?.corridorPolygon[0].stBuffer, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:5179' });
            //     //   let polygon = new Polygon(jsonfeatures[0].getGeometry().getCoordinates());
            //     //   let isInside = polygon.intersectsCoordinate(wsDroneMarker[flightPlanIdentifier]?.getGeometry().getCoordinates());
            //     //   let skyString = new LineString([corridorPolyLine[i], newPoint]);
            //     //   let skyLength = getLength(skyString);
            //     //   if(skyLength < 1500){ // 진입 예정 항적 하늘색
            //     //     console.log("blue", isInside, skyLength)
            //     //     changeLabelColor(flightPlanIdentifier, 'blue')
            //     //   }else{
            //     //     if(!checkWarningRed(flightPlanIdentifier)) changeLabelColor(flightPlanIdentifier, designAircrft.acceptColor, designAircrft.acceptBack)
            //     //   }
            //     // }
    
            //     // let tempString = new LineString([corridorPolyLine[i], corridorPolyLine[i+1]]);
            //     // let closestPoint = tempString.getClosestPoint(newPoint);
            //     // const distance = getDistance(newPoint, closestPoint); // 점과 폴리라인의 가장 가까운 점 사이의 거리를 계산
            //     // const tolerance = 1; // 1미터 이내면 교차한다고 간주
            //     // if (distance < tolerance) {
            //     //   tempString = new LineString([corridorPolyLine[i], closestPoint]);
            //     //   total += getLength(tempString);
            //     //   let allString = new LineString(corridorPolyLine);
            //     //   const length = getLength(allString);
            //     //   wsDroneMarker[flightPlanIdentifier].progress = ((total/length)*100).toFixed(0);
            //     //   break;
            //     // } else {
            //     //   total += getLength(tempString);
            //     // }
            //   // }
            //   // 항적에 회랑이 관제사가 관리하는 회랑에 포함 하면 아래 로직 체크 (범위를 줄이기 위함, 정확한 위치로 이동하는것만 체크하기 위함)
            //   // 나의 관제 웨이포인트(WAYPOINT)와 현재 위치로 계산해서 1분(기준은 변경가능)안에 들어오면 진입예정으로 체크
    
            //   let featureRemain = vectorSource.getFeatureById(flightPlanIdentifier + "_remainCorridor");
            //   for (let i = 0; i < corridorLinkPolygon?.length; i++) {
            //     let jsonfeatures = new GeoJSON().readFeatures(corridorLinkPolygon[i].stBuffer, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:5179' });
            //     let polygon = new Polygon(jsonfeatures[0].getGeometry().getCoordinates());
            //     let isInside = polygon.intersectsCoordinate(wsDroneMarker[flightPlanIdentifier]?.getGeometry().getCoordinates());
            //     if(isInside) { // 폴리건 안에 항적이 있으면
            //       let slicedArr = cloneDeep(corridorLinkPolygon).slice(i); // 인덱스 5부터 끝까지
            //       let remainpolygons = [];
            //       slicedArr.forEach(ind=>{
            //         let tempfeatures = new GeoJSON().readFeatures(ind.stBuffer);
            //         let coords = tempfeatures[0].getGeometry().getCoordinates();
            //         remainpolygons.push(turf.polygon(coords));
            //       })
            //       if(remainpolygons.length > 1){ // 남은 waypoint 가 1보다 클때
            //         let union = turf.union(turf.featureCollection(remainpolygons));
            //         let transformedPolygonCoords = transformCoords(union.geometry.coordinates, 'EPSG:4326', 'EPSG:5179');
            //         let intersectPolygon = new Polygon(transformedPolygonCoords);
            //         let intersectFeature = new Feature(intersectPolygon);
            //         if(featureRemain){
            //           wsDroneMarker[flightPlanIdentifier].remainCorridor?.setGeometry(intersectFeature.getGeometry())
            //         } else {
            //           intersectFeature.setStyle(remainCorridorStyle)
            //           intersectFeature.setId(flightPlanIdentifier + "_remainCorridor");
            //           wsDroneMarker[flightPlanIdentifier].remainCorridor = intersectFeature;
            //           vectorSource.addFeature(wsDroneMarker[flightPlanIdentifier].remainCorridor);
            //         }
            //       }else{ // 남은 waypoint = 1
            //         slicedArr.map(ind=>{
            //           let tempfeatures = new GeoJSON().readFeatures(ind.stBuffer, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:5179'});
            //           tempfeatures.forEach(feature => {
            //             if(featureRemain){
            //               wsDroneMarker[flightPlanIdentifier].remainCorridor?.setGeometry(feature.getGeometry())
            //             } else {
            //               feature.setStyle(remainCorridorStyle)
            //               feature.setId(flightPlanIdentifier + "_remainCorridor");
            //               wsDroneMarker[flightPlanIdentifier].remainCorridor = feature;
            //               vectorSource.addFeature(wsDroneMarker[flightPlanIdentifier].remainCorridor);
            //             }
            //           });
            //         })
            //       }
            //       break;
            //     }else{ // 폴리건 안에 항적이 없을 때
            //       // console.log("remainCorridor", cloneDeep(i), cloneDeep(corridorLinkPolygon.length-1), cloneDeep(wsDroneMarker[flightPlanIdentifier].remainCorridor))
            //       if(i==corridorLinkPolygon.length-1 && wsDroneMarker[flightPlanIdentifier].remainCorridor){
            //         vectorSource.removeFeature(wsDroneMarker[flightPlanIdentifier].remainCorridor);
            //       }
            //     }
            //   }
            // } else { //남은 회랑 꺼주기
            //   if(wsDroneMarker[flightPlanIdentifier].remainCorridor) vectorSource.removeFeature(wsDroneMarker[flightPlanIdentifier].remainCorridor);
            // }
          }
        } else {
          // if(wsDroneMarker[flightPlanIdentifier]){
          //   // 항적 remove, 라벨 remove
          //   removeWsDroneData(flightPlanIdentifier)
          //   // 회랑이탈 경고 있을 경우 remove
          //   let arr = warningList.filter(jnd=>jnd.type=="leave" && jnd.flightPlanId==flightPlanIdentifier && jnd.isView);
          //   arr.map(ind=>{
          //     ind.audio.muted = true;
          //     ind.audio.pause();
          //     ind.audio.currentTime = 0;
          //     ind.alarm = false;
          //     ind.isView = false;
          //   })
          //   // 침범 remove
          //   removeLineInvasion(true, flightPlanIdentifier);
          //   // 충돌 remove
          //   removeLineCollision(true, flightPlanIdentifier)
    
          //   // 기체이상/통신두절 remove
          //   let arr2 = warningList.filter(jnd=>(jnd.type=="aircraft" || jnd.type=="RF") && jnd.flightPlanIdentifier==flightPlanIdentifier && jnd.isView);
          //   console.log('[항적필터링] 기체이상/통신두절 지우기: ', arr2);
          //   arr2.map(ind => {
          //     ind.audio.muted = true;
          //     ind.audio.pause();
          //     ind.audio.currentTime = 0;
          //     ind.alarm = false;
          //     ind.isView = false;
          //   });
          // }
        }
      },
      
      createDroneLabel: async(flightPlanIdentifier: string) => {
        const { olMap, mapRotation, dragOverlay, vectorSource } = useMapStore.getState(); 
        const { wsDroneMarker, wsDroneLabel, wsLabelLine, labelOffset, actions: { changeLabelColor, styleFunction } } = get();  
        const { altitudeUnit, fontSize, fontWeight, fontStyle } = useSettingStore.getState(); 
        let container = document.createElement('div');
        container.classList.add('drone_label');
        // container.classList.add('ol-popup-custom');
        container.id = flightPlanIdentifier;
        let content = document.createElement('div');
        content.classList.add('popup-content');
        container.appendChild(content);
        document.body.appendChild(container);
    
        const updateDroneMarker = wsDroneMarker[flightPlanIdentifier];
        let convertAltitude = UtilFunc.convertKm(updateDroneMarker.altitude * 0.0003048); // 단위:FT, 1FT == 0.0003048 KM
        let convertIndicatedAlt = UtilFunc.convertKm(updateDroneMarker.indicatedAltitude * 0.0003048); // 단위:FT, 1FT == 0.0003048 KM
        let getAltitudeUnit = (altitudeUnit == null ) ? 'FT' : altitudeUnit // 지시고도 단위
    
        content.innerHTML = `
          <div class="label-row1">
            <span class="vertiport">${updateDroneMarker.destinationAerodrome}</span>
            <!--<span class="landingDirection"></span>-->
            <span class="warning" style="${updateDroneMarker?.warnColor ? `color: ${wsDroneMarker[flightPlanIdentifier].warnColor};` : ''}">${wsDroneMarker[flightPlanIdentifier]?.warnType || '' }</span>
          </div>
          <div class="label-row2">
            <span class="aircraft-info">${updateDroneMarker.callsign} ${updateDroneMarker.aircraftType}</span>
          </div>
          <div class="label-row3">
            <span class="altitude">${Math.floor(convertAltitude[getAltitudeUnit])}</span>
            <span class="nowUpDown" style="color: yellow; width: 5%;"></span>
            <span id="indicated-alt-${flightPlanIdentifier}" style="display: inline-block; text-align: center;">${Math.floor(convertIndicatedAlt[getAltitudeUnit])}</span>
            <span class="horVelocityKTS">${updateDroneMarker.horVelocityKTS}</span>
          </div>
          <div class="memo-section">
            <div class="memo-content" id="memo-${flightPlanIdentifier}">${updateDroneMarker.memo || ''}</div>
          </div>
        `;
    
        container.style.fontSize = `${fontSize}px`;
        container.style.fontWeight = fontWeight;
        container.style.fontStyle = fontStyle ? 'italic' : 'normal';
        container.style.borderRadius = `${designAircrft.borderRadius}px`;
        container.style.backgroundColor = designAircrft.decontrolBack;
    
        let originalCoord = updateDroneMarker.getGeometry().getCoordinates();
        // 라벨의 오프셋을 고려하여 라벨의 실제 위치를 계산
        const pixelCoord = olMap.getPixelFromCoordinate(originalCoord);
        let adjustedPixelCoord, adjustedCoord;
    
        const savedDataJSON = localStorage.getItem('labelPosition');
        let offset = [0,-labelOffset];
        let positioning = 'bottom-center'; 
        if(savedDataJSON) {
          offset = JSON.parse(savedDataJSON).offset;
          positioning = JSON.parse(savedDataJSON).positioning
          if(positioning === 'target') {
            const heading = updateDroneMarker.heading || 0;
            // 라벨을 드론의 헤딩 방향으로 배치할 거리 (예: 80픽셀)
            const distance = 120;
    
            // 오프셋 각도를 드론의 헤딩 각도에서 180도(반대 방향)로 설정
            let offsetAngle = (Number(heading) + mapRotation + 180) % 360; // 반대 방향의 각도
            offsetAngle = offsetAngle < 0 ? offsetAngle + 360 : offsetAngle; // 각도를 0 이상으로 조정
            const offsetAngleRad = offsetAngle * Math.PI / 180; // 라디안으로 변환
    
            // 거리와 각도를 기반으로 오프셋 계산
            const offsetX = distance * Math.sin(offsetAngleRad); // X축 방향으로 오프셋
            const offsetY = distance * Math.cos(offsetAngleRad); // Y축 방향으로 오프셋
    
            // 라벨의 위치를 헤딩에 맞게 조정 (드론의 뒤쪽으로 이동)
            adjustedPixelCoord = [pixelCoord[0] + offsetX, pixelCoord[1] - offsetY]; // Y축 방향 반전
            adjustedCoord = olMap.getCoordinateFromPixel(adjustedPixelCoord);
    
            // 오프셋 값을 업데이트
            offset[0] = offsetX;
            offset[1] = offsetY;
            positioning = 'center-center';
    
            updateDroneMarker.isTarget = true; // 타겟설정된 드론과 드래그로 라벨위치를 옮기는 드론 다르게 계산하기 위함
            set((state)=>({
              wsDroneMarker: {
                ...state.wsDroneMarker,
                [flightPlanIdentifier] : updateDroneMarker
              }
            }));
          } else {
            adjustedPixelCoord = [pixelCoord[0] + offset[0], pixelCoord[1] + offset[1]];
            adjustedCoord = olMap.getCoordinateFromPixel(adjustedPixelCoord);
          }
        } else {
          adjustedPixelCoord = [pixelCoord[0] + offset[0], pixelCoord[1] + offset[1]];
          adjustedCoord = olMap.getCoordinateFromPixel(adjustedPixelCoord);
    
          localStorage.setItem('labelPosition', JSON.stringify({ positioning: positioning, offset: offset }))
        }
        const updateDroneLabel = new Overlay({
          position: adjustedCoord,
          positioning: positioning as Positioning,
          element: container,
          stopEvent: false,
          insertFirst: true,
          id: flightPlanIdentifier
        });
    
        const updateOlMap = olMap;
        const updateDragOverlay = dragOverlay;
        
        updateOlMap.addOverlay(updateDroneLabel);
        updateDragOverlay.addOverlay(updateDroneLabel);

        updateDroneLabel.set('x', offset[0]);
        updateDroneLabel.set('y', offset[1]);

        // 드론 피처와 라벨 오버레이를 연결하는 LineString 생성
        const updateLabelLine = new Feature({
          geometry: new LineString([originalCoord, adjustedCoord]), // 원래 좌표와 조정된 좌표를 연결
          type: "wsLabelLine",
        });
        
        //기본 초록색
        let color = designAircrft.acceptColor;  //라벨 글씨 색
        let lineColor = designAircrft.acceptColor; //라벨 라인/외곽선 색
        let backColor = designAircrft.acceptBack;
    
        //통신 타입에 따라 색 변경
        if(updateDroneMarker.get('type') == 'adsb2') {
          color = designAircrft.adsbColor;
          lineColor = designAircrft.adsbColor;
          backColor = designAircrft.acceptBack;
        }
    
        updateLabelLine.setStyle(styleFunction)

        set((state)=>({
          wsDroneLabel : {
            ...state.wsDroneLabel,
            [flightPlanIdentifier] : updateDroneLabel
          },
          wsLabelLine : {
            ...state.wsLabelLine,
            [flightPlanIdentifier] : updateLabelLine
          },
        }))

        changeLabelColor(flightPlanIdentifier, color, lineColor, backColor);
        
    
        vectorSource.addFeature(updateLabelLine);
    
        // 우측 컨텍스트메뉴 우선 사용 X
        // container.addEventListener('contextmenu', (evt) =>{
        //   evt.preventDefault();  // 기본 우클릭 메뉴 막기
    
        //   const existingMenu = document.querySelector('.context-menu');
        //   if(!existingMenu) {
        //     const pixel = [evt.clientX, evt.clientY];  // 마우스 클릭 위치에 따라 메뉴 표시
        //     openContextMenu(pixel, updateDroneMarker);
        //   }
        // });

        console.log('[createDroneLabel] 1: ', wsDroneMarker, wsDroneLabel, wsLabelLine);
        console.log('[createDroneLabel] 2: ', dragOverlay, olMap.getOverlays());
      },
    
      updateDroneLabel: (flightPlanIdentifier: string) => {
        const { wsDroneMarker, wsDroneLabel } = get();
        const { altitudeUnit } = useSettingStore.getState(); 
        let altElement = wsDroneLabel[flightPlanIdentifier].getElement().querySelector('.altitude'); // 현재고도
        let indicatedAltElement = wsDroneLabel[flightPlanIdentifier].getElement().querySelector(`#indicated-alt-${flightPlanIdentifier}`) // 지시고도
    
        let nowUpDownElement = wsDroneLabel[flightPlanIdentifier].getElement().querySelector('.nowUpDown'); // 상승하강 표시 업데이트
        let horVelocityKTSElement = wsDroneLabel[flightPlanIdentifier].getElement().querySelector('.horVelocityKTS'); // Ground-Speed 업데이트
        let landingDirectionElement = wsDroneLabel[flightPlanIdentifier].getElement().querySelector('.landingDirection'); // 버티포트 착륙방향 업데이트(추후)
    
        if (altElement && nowUpDownElement) {
          let prevAltitude =  Math.floor(wsDroneMarker[flightPlanIdentifier].previousAltitude);
          let nowAltitude = Math.floor(wsDroneMarker[flightPlanIdentifier].altitude);
    
          let convertNowAlt = UtilFunc.convertKm(nowAltitude * 0.0003048); // 단위:FT, 1FT == 0.0003048 KM
          let convertIndicatedAlt = UtilFunc.convertKm(wsDroneMarker[flightPlanIdentifier].indicatedAltitude * 0.0003048);
    
          let getAltitudeUnit = (altitudeUnit == null ) ? 'FT' : altitudeUnit
    
          // 현재고도 업데이트
          altElement.innerText = Math.floor(convertNowAlt[getAltitudeUnit]);
    
          // 지시고도 업데이트
          indicatedAltElement.innerText = Math.floor(convertIndicatedAlt[getAltitudeUnit]);
    
          let updown = (nowAltitude > prevAltitude) ? '↑' : (nowAltitude < prevAltitude) ? '↓' : '';
    
          // 상승하강 방향 업데이트
          nowUpDownElement.innerText = updown;
          //TO_DO 추후 verVelocityFPM 값 확인 후 교체
          //nowUpDownElement.innerHTML = (wsDroneMarker[flightPlanIdentifier].verVelocityFPM > 0) ? '↑' : (wsDroneMarker[flightPlanIdentifier].verVelocityFPM < 0) ? '↓' : '';
        }
    
        if(horVelocityKTSElement) {
          horVelocityKTSElement.innerText = Math.floor(wsDroneMarker[flightPlanIdentifier].horVelocityKTS);
        }
    
      },

      changeLabelColor: (id: string, color: string, lineColor: string, background: string, isWarning?: boolean) => {
        const { wsLabelLine, wsDroneLabel } = get();
        let label = wsDroneLabel[id]?.getElement();
        if (label && !wsDroneLabel[id]?.get('die')) {
          //경고일때만 외곽선 표출
          if (isWarning) {
            label.style.border = designAircrft.border + `px solid ${lineColor}`;
          } else {
            label.style.border = null;
          }
          label.style.color = color;
          // KT 요청으로 인해 라벨 BackGround 색상 삭제
          //label.style.backgroundColor = background;

          wsLabelLine[id].set('color', lineColor);
          wsLabelLine[id].set('width', designAircrft.border);
        }
      },
      setOriginqueue: () => {
        set({originQueue: new Queue()});
      }
    }
  
}))

export default usePlaybackStore;