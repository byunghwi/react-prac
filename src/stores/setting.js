import { create } from "zustand";

const useSettingStore = create((set, get)=> {
  return {
    fontSize: 12,
    fontWeight: 'normal', // lighter, bold
    fontStyle: false,// normal, oblique
    measurementLength: 'NM', // mi, FT, NM
    altitudeUnit: 'FT',
    speedUnit: 'Knot',
    volume: 0.5,
    // 마일/시간 (Miles per Hour, mph)
    // 노트 (Knot, kt or kn)
    // 피트/초 (Feet per Second, ft/s or fps)
    warningLimit: [],
    invasionLimit: {},
    collisionLimit: {},
    headerList: [
      {title:'TRAFFIC MONITORING SYSTEM', name:'MONITORING'},
      {title:'FPL MANAGER(FPL)', name:'FPL'},
      {title:'통신망', name:'NETWORK'}
    ],
    headerName: 'MONITORING',
    isFoldTools: false, // 모든 도구 접고 펼치기

    actions: {
      saveSetting: async(data) => {
        await saveSetting(data);
      }
    }
  }
})

export default useSettingStore;
