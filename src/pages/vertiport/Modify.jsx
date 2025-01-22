import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import useMapStore from '../../stores/map';
import UtilFunc from "../../utils/functions";
import useModalStore from '../../stores/modal';
import BaseMap from "../../components/BaseMap";
import apiService from '../../api/apiService';
import '../../styles/register.css'

export default function Modify() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showVertiport } = useMapStore();
  const { openModal, showLoading, hideLoading } = useModalStore();

  const [sidcvfpItem, setsidcvfpItem] = useState({});
  const [sidcvfpList, setsidcvfpList] = useState([]);
  const [vertiportDetail, setvertiportDetail] = useState({});
  let standEl = useRef(null);
  let fatoEl = useRef(null);

  useEffect(() => {
    const init = async() => {
      await getVertiportDetail(id)
      await getSidCvfpSmallList();
    }
    init();
  },[id])

  const getVertiportDetail = async(id) => {
    try {
      let response = await apiService.loadVertiportDetail(id);
      if(response) {
        setvertiportDetail(response);
        showVertiport([{id:response.vertiportId, lon:response.vertiportLon, lat:response.vertiportLat}], true)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getSidCvfpSmallList = async() => {
    try {
      let params = {dataType: "JSON"}
      let result = await apiService.loadSidCvfpSmallList(params);
      setsidcvfpList(result);
      setsidcvfpItem(result.find(ind=>ind.vertiportId === id))
    } catch (error) {
      console.log(error);
    }
  }

  const save = async() => {
    if(vertiportDetail.fatoinfo.length===0){
      vertiportDetail.fatoinfo.push({
        fatoCode: "F1",
        fatoLat: vertiportDetail.vertiportLat,
        fatoLon: vertiportDetail.vertiportLon
      });
    }
    if(vertiportDetail.standinfo.length===0){
      vertiportDetail.standinfo.push({
        standCode: "S1",
        standLat: vertiportDetail.vertiportLat,
        standLon: vertiportDetail.vertiportLon
      })
    }
    let fRole = /^F\d*$/
    let sRole = /^S\d*$/
    let chkValidation = 0;
    chkValidation = vertiportDetail.fatoinfo.reduce((tot, ind, i)=>tot + (fRole.test(ind.fatoCode) ? 0 : 1), 0)
    if(chkValidation > 0){
      openModal('Vertiport',"FATO code는 F로 시작해야 합니다.",true);
      return false;
    }
    chkValidation = vertiportDetail.standinfo.reduce((tot, ind, i)=>tot + (sRole.test(ind.standCode) ? 0 : 1), 0)
    if(chkValidation > 0){
      openModal('Vertiport',"STAND code는 S로 시작해야 합니다.",true);
      return false;
    }
    showLoading();
    console.log("vertiportDetail", vertiportDetail)
    await updateVertiportDetail(vertiportDetail)
    hideLoading();
  }

  const updateVertiportDetail = async() => {
    let result = await apiService.updateVertiportDetail(vertiportDetail);
    if(result === 200) {
      openModal('Vertiport',"수정 되었습니다.",true);
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
      let cloneObj = vertiportDetail.fatoinfo;
      cloneObj.push(newObj);
      setvertiportDetail((prev) => ({
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
      let cloneObj = vertiportDetail.standinfo;
      cloneObj.push(newObj);
      setvertiportDetail((prev) => ({
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
      let cloneObj = vertiportDetail.fatoinfo.filter((ind,i)=>i!==index);
      setvertiportDetail((prev) => ({
          ...prev,
          fatoinfo: cloneObj,
      }));
    }else{
      let cloneObj = vertiportDetail.standinfo.filter((ind,i)=>i!==index);
      setvertiportDetail((prev) => ({
          ...prev,
          standinfo: cloneObj,
      }));
    }
  }

  const checkVertiport = (event) => {
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
    handleChange(event, event.target.id)
    setTimeout(() => {
      let lat = Number(vertiportDetail.vertiportLat);
      let lon = Number(vertiportDetail.vertiportLon);
      if (event.key!== '.' && lat>0 && lon>0){
        showVertiport([{id:vertiportDetail.vertiportId, lon:lon, lat:lat}], true)
      }
    }, 1);
  }

  const list = () => {
    navigate('/vertiport/list');
  }

  // const remove = async() => {
  //   await deleteVertiport(vertiportDetail.vertiportId)
  //   list();
  // }

  // const deleteVertiport = async(id) => {
  //   await apiService.deleteVertiport(id);
  // }

  const handleChange = (event, key) => {
    setvertiportDetail((prev) => ({
        ...prev,
        [key]: event.target.value,
    }));
  };

  const handleChangeSub = (event, type, key, index) => {
    let cloneObj = vertiportDetail[type];
    cloneObj[index][key] = event.target.value;
    setvertiportDetail((prev) => ({
        ...prev,
        [type]: cloneObj,
    }));
  };


  return (
    <div className="wrap-list" >
      <div className="title">버티포트 수정</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tbody>
            <tr>
              <td>ID</td><td><input type="text" value={vertiportDetail.vertiportId || ""} readOnly /></td>
            </tr>
            <tr>
              <td>이름</td><td><input type="text" value={vertiportDetail.vertiportName || ""} onChange={(e)=>checkVertiport(e,'vertiportName')} /></td>
            </tr>
            <tr>
              <td>종류</td><td><input type="text" value={vertiportDetail.vertiportKind || ""} onChange={(e)=>handleChange(e,'vertiportKind')} /></td>
            </tr>
            <tr>
              <td>CALLSIGN</td><td><input type="text" value={vertiportDetail.vertiportCallsign || ""} onChange={(e)=>handleChange(e,'vertiportCallsign')} /></td>
            </tr>
            <tr>
              <td>통신채널</td><td><input type="text" value={vertiportDetail.vertiportChannel || ""} onKeyDown={UtilFunc.handleKeydownNumber} onChange={(e)=>handleChange(e,'vertiportChannel')} /></td>
            </tr>
            <tr>
              <td>이착륙 방향</td>
              <td>
                <select className="sel50" value={vertiportDetail.vertiportDepDirection || ""} onChange={(e)=>handleChange(e,'vertiportDepDirection')}>
                  {sidcvfpItem?.sidCode?.map((item, index) => (
                    <option key={index} value={item}>{ item }</option>
                  ))}
                </select>
                <select className="sel50" value={vertiportDetail.vertiportDesDirection || ""} onChange={(e)=>handleChange(e,'vertiportDesDirection')}>
                  {sidcvfpItem?.cvfpCode?.map((item, index) => (
                    <option key={index} value={item}>{ item }</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>주소</td><td><input type="text" value={vertiportDetail.vertiportAddress || ""} onChange={(e)=>handleChange(e,'vertiportAddress')} /></td>
            </tr>
            </tbody>
          </table>
          <table className="mini">
            <tbody>
            <tr>
              <td>주파수</td><td><input type="text" value={vertiportDetail.vertiportFrequency || ""} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChange(e,'vertiportFrequency')} /></td>
              <td>대역폭</td><td><input type="text" value={vertiportDetail.vertiportBandwidth || ""} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChange(e,'vertiportBandwidth')} /></td>
            </tr>
            <tr>
              <td>높이</td><td><input type="text" value={vertiportDetail.vertiportHeight || ""} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChange(e,'vertiportHeight')} /></td>
              <td>높이기준</td><td>
                <select value={vertiportDetail.vertiportHeightCriteria} onChange={(e)=>handleChange(e,'vertiportHeightCriteria')}>
                  <option value="AGL">AGL(지표면기준)</option>
                  <option value="MSL">MSL(평균해수면기준)</option>
                  <option value="AMSL">AMSL(?)</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>위도</td><td><input type="text" value={vertiportDetail.vertiportLat || ""} onChange={(e)=>checkVertiport(e,'vertiportLat')} /></td>
              <td>경도</td><td><input type="text" id="vertiportLon" value={vertiportDetail.vertiportLon || ""} onChange={(e)=>checkVertiport(e,'vertiportLon')}  /></td>
            </tr>
            </tbody>
          </table>
          <table className="fs">
          <tbody>
            <tr>
              <td>FATO({ vertiportDetail?.fatoinfo?.length || 0}) <button className="add" onClick={()=>addRow('fato')}>add</button></td>
              <td>STAND({ vertiportDetail?.standinfo?.length || 0 }) <button className="add" onClick={()=>addRow('stand')}>add</button></td>
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
                    {vertiportDetail?.fatoinfo?.map(( item, index ) => (
                      <tr key={index}>
                        <td><input type="text" value={item.fatoCode} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoCode', index)} /></td>
                        <td><input type="text" value={item.fatoLat} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoLat', index)} /></td>
                        <td><input type="text" value={item.fatoLon} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChangeSub(e,'fatoinfo', 'fatoLon', index)} /></td>
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
                    {vertiportDetail?.standinfo?.map(( item, index ) => (
                      <tr key={index}>
                        <td><input type="text" value={item.standCode} onChange={(e)=>handleChangeSub(e,'standinfo', 'standCode', index)} /></td>
                      <td><input type="text" value={item.standLat} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChangeSub(e,'standinfo', 'standLat', index)} /></td>
                      <td><input type="text" value={item.standLon} onKeyDown={UtilFunc.handleKeydownFloat} onChange={(e)=>handleChangeSub(e,'standinfo', 'standLon', index)} /></td>
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
        {/* <button onClick={()=>remove()}>삭제</button> */}
      </div>
    </div>
  );
}
