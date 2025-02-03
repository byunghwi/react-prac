import React, { useState, useEffect, useRef } from 'react';
import useWaypointStore from '../stores/waypoint';
import useModalStore from '../stores/modal';
import '../styles/waypointpopup.css'

export default function WaypointPopup({ isOpen, list, addWaypoints }) {
  const { showLoading, hideLoading } = useModalStore();
  const { waypointList, isOpenWaypointPop, setisOpenWaypointPop, SrchValue, setSrchValue, createWaypoint, modifyWaypoint, allWaypoints } = useWaypointStore();

  const [selectedItem, setselectedItem] = useState(null);
  const [mode, setmode] = useState('');
  let chkWaypoint = useRef([]);

  useEffect(() => {
    chkWaypoint.current.forEach((ind,i) => {
      let temp = list.find(jnd=>jnd.waypointCode===ind.value)
      if (temp) ind.checked = true;
    });
  },[list])

  const onAddWaypoints = async() => {
    let arr = chkWaypoint.current.filter(element => element.checked).map(ele=>{
      let obj = waypointList.find(ind=>ind.waypointCode===ele.value) ;
      obj.pointType = 'waypoint'
      return obj;
    });
    addWaypoints(arr);
  }

  const close = () => {
    setisOpenWaypointPop(!isOpenWaypointPop);
  }

  const allCheck = (event) => {
    if(event.target.checked){
      chkWaypoint.current.forEach(element => {
        element.checked = true;
      });
    }else{
      chkWaypoint.current.forEach(element => {
        element.checked = false;
      });
    }
  }

  const showHiddenTable = (data, type) => {
    if(type === 'create') {
      setselectedItem({
        waypointCode: "",
        waypointAlt: "",
        waypointLat: "",
        waypointLon: "",
      });
      setmode(type)
    } else if(type === 'modify') {
      setselectedItem({...data});
      setmode(type)
    }
  }

  const create = async() => {
    await createWaypoint(selectedItem);
    setselectedItem(null); // 숨기기
  }

  const modify = async() => {
    await modifyWaypoint(selectedItem);
    await onAddWaypoints();
    setselectedItem(null); // 숨기기
  }

  const cancel = async() => {
    setselectedItem(null); // 숨기기
  }

  const search = async() => {
    showLoading();
    await allWaypoints();
    hideLoading();
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
    // console.log("handleChange", key, event.target.value)
    setselectedItem({
      ...selectedItem,
      [key]: event.target.value,
    });
  };

  if (!isOpen) return null; // isOpen이 false일 때 아무것도 렌더링하지 않음

  return (
    <div className="modal-overlay">
      <div className="wrap-popup-list">
        <div className="title-bar">
          <div className="title">WAYPOINT 목록</div>
          <div><button onClick={close}>닫기</button></div>
        </div>
        <div className="wrap-search">
          <input type="text" value={SrchValue} placeholder="search.." onChange={(e)=> setSrchValue(e.target.value)}/>
        <button onClick={search}>Search</button>
        </div>
        <div className="wrap-table">
          <table className="fs_head" >
            <thead>
              <tr>
                <td><input type="checkbox" onClick={allCheck} /></td>
                <td>WAYPOINT</td>
                <td>고도</td>
                <td>위도</td>
                <td>경도</td>
                <td>관리</td>
              </tr>
            </thead>
            <tbody>
              {waypointList?.map(( item, index ) => (
                <tr key={index}>
                  <td><input type="checkbox" ref={(el) => (chkWaypoint.current[index] = el)} value={item.waypointCode} /></td>
                  <td>{item.waypointCode}</td>
                  <td>{item.waypointAlt}</td>
                  <td>{item.waypointLat}</td>
                  <td>{item.waypointLon}</td>
                  <td><button className="modify" onClick={()=>showHiddenTable(item, 'modify')}>수정</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="wrap-reg">
            <button onClick={onAddWaypoints}>추가</button>
            <button onClick={()=>showHiddenTable(null, 'create')}>신규</button>
          </div>
        </div>
        {selectedItem && <div className="hidden-table">
          <div className="title-bar">
            <div className="title">WAYPOINT</div>
          </div>
          <table className="fs_head" >
            <tbody>
              <tr>
                <td>WAYPOINT</td>
                <td><input type="text" value={selectedItem.waypointCode} onChange={(e)=>handleChange(e,'waypointCode')} /></td>
                <td>고도</td>
                <td><input type="text" value={selectedItem.waypointAlt} onChange={(e)=>handleChange(e,'waypointAlt', true)} /></td>
              </tr>
              <tr>
                <td>위도</td>
                <td><input type="text" value={selectedItem.waypointLat} onChange={(e)=>handleChange(e,'waypointLat', true)} /></td>
                <td>경도</td>
                <td><input type="text" value={selectedItem.waypointLon} onChange={(e)=>handleChange(e,'waypointLon', true)} /></td>
              </tr>
            </tbody>
          </table>
          <div className="wrap-reg">
            {mode==='modify' && <button onClick={modify}>수정</button>}
            {mode==='create' && <button onClick={create}>저장</button>}
            <button onClick={cancel}>취소</button>
          </div>
        </div>}
      </div>
    </div>
  )
}

