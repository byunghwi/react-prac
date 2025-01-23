import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UtilFunc from "../../utils/functions";
import useMapStore from '../../stores/map';
import BaseMap from "../../components/BaseMap";
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';

export default function Register() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, openModal } = useModalStore();
  const { showVertiport } = useMapStore();

  const [formData, setformData] = useState({
    "vertiportName": "",
    "vertiportId": "",
    "vertiportKind": "",
    "vertiportCallsign": "",
    "vertiportFrequency": 0,
    "vertiportBandwidth": 0,
    "vertiportChannel": 0,
    "vertiportHeight": 0,
    "vertiportHeightCriteria": "AGL",
    "vertiportDepDirection": "",
    "vertiportDesDirection": "",
    "vertiportLat": 37.564293,
    "vertiportLon": 126.623,
    "vertiportAddress": "",
    "fatoinfo": [],
    "standinfo": []
  });
  let standEl = useRef(null);
  let fatoEl = useRef(null);

  const checkVertiport = (event) => {
    let lat = Number(formData.vertiportLat);
    let lon = Number(formData.vertiportLon);
    if (event.key !== "." && lat > 0 && lon > 0) {
      showVertiport(
        [{ id: formData.vertiportId, lon: lon, lat: lat }],
        true,
        true
      );
    }
  };

  const list = () => {
    navigate('/vertiport/list');
  }

  const save = async() => {
    if(formData.vertiportId.length === 0){
      openModal('Vertiport',"id를 입력해 주세요.",true);
      return false;
    }
    if(formData.fatoinfo.length===0){
      formData.fatoinfo.push({
        fatoCode: "F1",
        fatoLat: formData.vertiportLat,
        fatoLon: formData.vertiportLon
      });
    }
    if(formData.standinfo.length===0){
      formData.standinfo.push({
        standCode: "S1",
        standLat: formData.vertiportLat,
        standLon: formData.vertiportLon
      })
    }

    let fRole = /^F\d*$/;
    let sRole = /^S\d*$/;
    let chkValidation = 0;
    chkValidation = formData.fatoinfo.reduce((tot, ind, i)=>tot + (fRole.test(ind.fatoCode) ? 0 : 1), 0)
    if(chkValidation > 0){
      openModal('Vertiport',"FATO code는 F로 시작해야 합니다.",true);
      return false;
    }
    chkValidation = formData.standinfo.reduce((tot, ind, i)=>tot + (sRole.test(ind.standCode) ? 0 : 1), 0)
    if(chkValidation > 0){
      openModal('Vertiport',"STAND code는 S로 시작해야 합니다.",true);
      return false;
    }

    showLoading();
    console.log("저장 전 formData 확인 : ", formData);
    await insertVertiportDetail(formData);
    hideLoading();
  }

  const insertVertiportDetail = async(data) => {
    let result = await apiService.insertVertiportDetail(data);
    if(result === 200) {
      openModal('Vertiport',"등록 되었습니다.",true);
      list();
    }else{
      openModal('Vertiport',result,true);
    }
  }

  const addRow = (mode) => {
    if(mode==='fato'){
      let newObj = {
        fatoCode: "",
        fatoLat: "",
        fatoLon: ""
      };
      let cloneObj = formData.fatoinfo;
      cloneObj.push(newObj);
      setformData((prev) => ({
          ...prev,
          fatoinfo: cloneObj,
      }));
      setTimeout(() => {
        fatoEl.scrollTop = fatoEl.offsetHeight + fatoEl.scrollHeight;
      }, 1);
    }else{
      let newObj = {
        standCode: "",
        standLat: "",
        standLon: ""
      };
      let cloneObj = formData.standinfo;
      cloneObj.push(newObj);
      setformData((prev) => ({
          ...prev,
          standinfo: cloneObj,
      }));
      setTimeout(() => {
        standEl.scrollTop = standEl.offsetHeight + standEl.scrollHeight;
      }, 1);
    }
  }

  const removeRow = (mode, index) => {
    if(mode==='fato'){
      let cloneObj = formData.fatoinfo.filter((ind,i)=>i!==index);
      setformData((prev) => ({
          ...prev,
          fatoinfo: cloneObj,
      }));
    }else{
      let cloneObj = formData.standinfo.filter((ind,i)=>i!==index);
      setformData((prev) => ({
          ...prev,
          standinfo: cloneObj,
      }));
    }
  }

  const handleChange = (event, key, checkFloat) => {
    if(checkFloat){
      const regex = /^[0-9.]*$/;
      if (!regex.test(event.target.value)) {
        // 올바르지 않은 입력 제거
        event.target.value = event.target.value.replace(/[^0-9.]/g, "");
      }
      // 점이 여러 번 입력되는 경우 제거
      const parts = event.target.value.split(".");
      if (parts.length > 2) {
        event.target.value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
      }
    }
    setformData((prev) => ({
        ...prev,
        [key]: event.target.value,
    }));
  };

  const handleChangeSub = (event, type, key, index, checkFloat) => {
    if(checkFloat){
      const regex = /^[0-9.]*$/;
      if (!regex.test(event.target.value)) {
        // 올바르지 않은 입력 제거
        event.target.value = event.target.value.replace(/[^0-9.]/g, "");
      }
      // 점이 여러 번 입력되는 경우 제거
      const parts = event.target.value.split(".");
      if (parts.length > 2) {
        event.target.value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
      }
    }
    let cloneObj = formData[type];
    cloneObj[index][key] = event.target.value;
    setformData((prev) => ({
        ...prev,
        [type]: cloneObj,
    }));
  };

  return (
    <div className="wrap-list" >
      <div className="title">버티포트 등록</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
          <tbody>
            <tr>
              <td>ID</td><td><input type="text" value={formData.vertiportId} onKeyUp={checkVertiport} onChange={(e)=>handleChange(e,'vertiportId')} /></td>
            </tr>
            <tr>
              <td>이름</td><td><input type="text" value={formData.vertiportName} onKeyUp={checkVertiport} onChange={(e)=>handleChange(e,'vertiportName')} /></td>
            </tr>
            <tr>
              <td>종류</td><td><input type="text" value={formData.vertiportKind} onChange={(e)=>handleChange(e,'vertiportKind')} /></td>
            </tr>
            <tr>
              <td>CALLSIGN</td><td><input type="text" value={formData.vertiportCallsign} onChange={(e)=>handleChange(e,'vertiportCallsign')} /></td>
            </tr>
            <tr>
              <td>통신채널</td><td><input type="text" value={formData.vertiportChannel} onChange={(e)=>handleChange(e,'vertiportChannel', true)} /></td>
            </tr>
            <tr>
              <td>주소</td><td><input type="text" value={formData.vertiportAddress} onChange={(e)=>handleChange(e,'vertiportAddress')} /></td>
            </tr>
            </tbody>
          </table>
          <table className="mini">
          <tbody>
            <tr>
              <td>주파수</td><td><input type="text" value={formData.vertiportFrequency} onChange={(e)=>handleChange(e,'vertiportFrequency', true)} /></td>
              <td>대역폭</td><td><input type="text" value={formData.vertiportBandwidth} onChange={(e)=>handleChange(e,'vertiportBandwidth', true)} /></td>
            </tr>
            <tr>
              <td>높이</td><td><input type="text" value={formData.vertiportHeight} onChange={(e)=>handleChange(e,'vertiportHeight', true)} /></td>
              <td>높이기준</td>
              <td>
                <select value={formData.vertiportHeightCriteria} onChange={(e)=>handleChange(e,'vertiportHeightCriteria')}>
                  <option value="AGL">AGL(지표면기준)</option>
                  <option value="MSL">MSL(평균해수면기준)</option>
                  <option value="AMSL">AMSL(?)</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>위도</td><td><input type="text" value={formData.vertiportLat} onKeyUp={checkVertiport} onChange={(e)=>handleChange(e,'vertiportLat', true)} /></td>
              <td>경도</td><td><input type="text" value={formData.vertiportLon} onKeyUp={checkVertiport} onChange={(e)=>handleChange(e,'vertiportLon', true)} /></td>
            </tr>
            </tbody>
          </table>
          <table className="fs">
          <tbody>
            <tr>
              <td>FATO({ formData.fatoinfo?.length }) <button className="add" onClick={()=>addRow('fato')}>add</button></td>
              <td>STAND({ formData.standinfo?.length }) <button className="add" onClick={()=>addRow('stand')}>add</button></td>
            </tr>
            <tr>
              <td>
                <table className="fs_head" >
                  <thead>
                    <tr>
                      <td>코드</td>
                      <td>위도</td>
                      <td>경도</td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody ref={fatoEl}>
                    {formData.fatoinfo?.map(( item, index ) => (
                      <tr key={index}>
                        <td><input type="text" value={item.fatoCode} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoCode', index)} /></td>
                        <td><input type="text" value={item.fatoLat} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoLat', index, true)} /></td>
                        <td><input type="text" value={item.fatoLon} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoLon', index, true)} /></td>
                        <td><button className="remove" onClick={()=>removeRow('fato',index)}>-</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td>
                <table className="fs_head" >
                  <thead>
                    <tr>
                      <td>코드</td>
                      <td>위도</td>
                      <td>경도</td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody ref={standEl}>
                    {formData.standinfo?.map(( item, index ) => (
                      <tr key={index}>
                        <td><input type="text" value={item.standCode} onChange={(e)=>handleChangeSub(e,'standinfo', 'standCode', index)} /></td>
                        <td><input type="text" value={item.standLat} onChange={(e)=>handleChangeSub(e,'standinfo', 'standLat', index, true)} /></td>
                        <td><input type="text" value={item.standLon} onChange={(e)=>handleChangeSub(e,'standinfo', 'standLon', index, true)} /></td>
                        <td><button className="remove" onClick={()=>removeRow('stand',index)}>-</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <BaseMap />
      </div>
      <div className="wrap-reg">
          <button onClick={()=>save()}>저장</button>
          <button onClick={()=>list()}>목록</button>
        </div>
    </div>
  );
}


