import { create } from "zustand";
// import { cloneDeep } from 'lodash';
import apiService from '../api/apiService';

interface SettingStore {
  cntTotalList: number,
  setcntTotalList: (val:number) => void,
  pageNo: number,
  setpageNo: (val:number) => void,
  SrchType: any,
  setSrchType: (val?:string) => void,
  SrchValue: any,
  setSrchValue: (val?:string) => void,
  fontSize: number,
  fontWeight: string, // lighter, bold
  fontStyle: boolean, // normal, oblique
  measurementLength: string, // mi, FT, NM
  altitudeUnit: string,
  speedUnit: string,
  volume: any,
  warningLimit: any,
  invasionLimit: any,
  collisionLimit: any,
  headerList: any,
  headerName: string,
  isFoldTools: boolean, // 모든 도구 접고 펼치기
  saveSetting:  (data) => void,
  getSetting: () => void,
  getWarningLimit: () => void,
}

const useSettingStore = create<SettingStore>((set, get) => ({
  cntTotalList: 0,
  setcntTotalList: (val:number) => set({ cntTotalList: val}),
  pageNo: 1,
  setpageNo: (val:number) => set({ pageNo: val}),
  userDetail: {},
  SrchType: '',
  setSrchType: (val?:string) => set({ SrchType: val}),
  SrchValue: '',
  setSrchValue: (val?:string) => set({ SrchValue: val}),
  fontSize:  (12),
  fontWeight:  ('normal'), // lighter, bold
  fontStyle:  (false), // normal, oblique
  measurementLength:  ('NM'), // mi, FT, NM
  altitudeUnit:  ('FT'),
  speedUnit:  ('Knot'),
  volume:  (0.5),
  warningLimit:  ([]),
  invasionLimit:  ({}),
  collisionLimit:  ({}),
  headerList:  ([
    {title:'TRAFFIC MONITORING SYSTEM', name:'MONITORING'},
    {title:'FPL MANAGER(FPL)', name:'FPL'},
    {title:'통신망', name:'NETWORK'}
  ]),
  headerName:  ('MONITORING'),
  isFoldTools:  (false), // 모든 도구 접고 펼치기
  saveSetting:  async(data) => {
    await apiService.saveSetting(data);
  },
  getSetting: async() => {
    try {
      let json = await apiService.getSetting('traffic');
      if(json){
        if(json.alarmsound) get().volume = json.alarmsound > 1 ? 1 : json.alarmsound;
        if(json.textsize) get().fontSize = json.textsize;
        if(json.distance) get().measurementLength = json.distance;
        if(json.textitalic) get().fontStyle = json.textitalic==='Y' ? true : false;
        if(json.textthick) get().fontWeight = json.textthick;
        if(json.altitude) get().altitudeUnit = json.altitude;
        if(json.speed) get().speedUnit = json.speed;
      }
    } catch (error) {
      console.log(error);
    }
  },
  getWarningLimit: async() => { // 충돌/침범 임계치
    try {
      let res = await apiService.getWarningLimit();
      if(res) {
        get().warningLimit = res;
        set({
          //침범임계치
          invasionLimit: get().warningLimit.find(item =>
            item.limit_type === "G" && item.limit_level === "Alert"
          ),
          //충돌임계치
          collisionLimit: get().warningLimit.find(item =>
            item.limit_type === "T" && item.limit_level === "Alert"
          )
        })
      }
    } catch (error) {
      console.log(error);
    }
  },
}))

export default useSettingStore;
