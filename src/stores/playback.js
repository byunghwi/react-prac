import { create } from "zustand";
import Utilfunc from "../utils/functions"
import Queue from "../utils/queue"
import useMapStore from "../stores/map";
import apiService from "../api/apiService"

const usePlaybackStore = create((set, get) => {
  return {
    playback_id: null,
    originQueue: new Queue(),
    socket: null,
    isWSMsgRequired: false,
    wsDroneMarker: null,
    wsDroneLabel: null,
    wsLabelLine: null,
    wsDroneVector: null,


    actions: {
      connect: async () => {
        const uuid = Utilfunc.generateUUID();
        set({ playback_id: uuid });
        set({ socket: new WebSocket(`ws://211.189.132.21:7080/ws2?token_id=${uuid}`) });

        const { socket } = get();
        socket.onerror = (error) => {
          console.log("websocket connect error", error);
        }
        socket.onopen = () => {
          console.log("[socket] connected");
          socket.send(`{"type":"**MONITOR**"}`);
        }
        socket.onclose = () => {
          console.log("[socket] disconnected");
          window.location.reload();
        }
        socket.onmessage = async (ms) => {
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
      pushWsDroneData: async () => {
        console.log('pushWsDroneData..');
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
      setWsDroneVector: (value) => set({ setWsDroneVector: value}),

      removeWsDroneData: (id) =>{
        // const { wsDroneMarker, wsLabelLine, wsDroneLabel, wsDroneVector } = get(); 
        // const { olMap, dragOverlay, vectorSource } = useCorridorStore.getState(); // zustand의 상태 가져오기
        // dragOverlay.removeOverlay(wsDroneLabel[id]);
        // olMap.removeOverlay(olMap.value.getOverlayById(id));
        // wsDroneMarker[id]?.remainCorridor && vectorSource.removeFeature(wsDroneMarker.value[id].remainCorridor);
        // wsDroneMarker.value[id] && vectorSource.removeFeature(wsDroneMarker[id]);
        // wsLabelLine.value[id] && vectorSource.removeFeature(wsLabelLine.value[id]);
        // wsDroneVector[id] && vectorSource.removeFeature(wsDroneVector[id]);
        // set(delete wsDroneMarker[id]);
        // delete wsLabelLine[id];
        // delete wsDroneLabel[id];
        // delete wsDroneVector[id];
    
        // // 이착륙/충돌 시연 끄기
        // isVisibleCollision3D.value && (isVisibleCollision3D.value = false);
        // isVisibleLanding3D.value && (isVisibleLanding3D.value = false);
      }
    }
  }
})

export default usePlaybackStore;