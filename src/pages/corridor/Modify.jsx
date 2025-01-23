import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';
import useSettingStore from "../../stores/setting";
import useMapStore from "../../stores/map";
import useWaypointStore from "../../stores/waypoint";

import UtilFunc from "../../utils/functions";
import BaseMap from "../../components/BaseMap"
// import WaypointPopup from "@/components/WaypointPopup.vue"
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import cloneDeep from 'lodash';

export default function List() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading, openModal } = useModalStore();
  const { drawCorridors, hideCorridors, hideVertiport, corridorDetail, setcorridorDetail } = useMapStore();
  const { allWaypoints, isOpenWaypointPop } = useWaypointStore();

  const [vertiportList, setvertiportList] = useState([]);
  const [dpList, setdpList] = useState(null);
  const [dnList, setdnList] = useState(null);
  let chkWaypoint = useRef([]);

  useEffect(() => {
    initPage();
  },[id])

  useEffect(() => {
    // console.log("corridorDetail", corridorDetail.corridorDetail)
    if(corridorDetail.corridorDetail && vertiportList.length > 0){
      console.log("[vertiportList,corridorDetail]", corridorDetail.departure, corridorDetail.destination)
      let dp = vertiportList.find(ind=>ind.vertiportId===corridorDetail.departure);
      let dn = vertiportList.find(ind=>ind.vertiportId===corridorDetail.destination);
      // console.log("dp", dp)
      setdpList(dp);
      setdnList(dn);
  //     setcorridorDetail({
  //       ...corridorDetail,
  //       // departure : dp,
  //       // destination : dn,
  //       corridorDetail : corridorDetail.corridorDetail.filter(ind=>ind.pointType==='waypoint')
  //     });
    }
  },[vertiportList,corridorDetail])

  // useEffect(() => {
  //   console.log("[dpList]", typeof (corridorDetail.departure) , typeof (corridorDetail.destination) , dnList , dpList)
  // },[dpList])

  // useEffect(() => {
  //   console.log("[dnList]", typeof (corridorDetail.departure) , typeof (corridorDetail.destination) , dnList , dpList)
  // },[dnList])

  // useEffect(() => {
  //   console.log("[dnList, dpList]", typeof (corridorDetail.departure) , typeof (corridorDetail.destination) , dnList , dpList)
  // },[dnList, dpList])



  useEffect(() => {
    console.log("useEffect[dnList, dpList]")
    if(typeof (corridorDetail.departure) === "string" && typeof (corridorDetail.destination) === "string" && dnList && dpList){
      console.log("[dnList, dpList]", corridorDetail.departure, dpList)
      makeCorridors("watch");
    }
  },[dnList, dpList])



  const initPage = async() => {
    showLoading();
    await getCorridorDetail(id);
    await allWaypoints();
    await getVertiportList();
    hideLoading();
  }

  const getVertiportList = async() => {
    try {
      let params = {dataType: "JSON"}
      let result = await apiService.loadVertiportList(params);
      setvertiportList(result.vertiportList);
    } catch (error) {
      console.log(error);
    }
  }

  const getCorridorDetail = async(id) => {
    try {
      let response = await apiService.loadCorridorDetail(id);
      if(response) {
        response.corridorDetail = response.corridorDetail.filter(ind=>ind.pointType==='waypoint')
        setcorridorDetail(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const save = async() => {
    showLoading();
    if(corridorDetail.corridorDetail) {
      corridorDetail.corridorDetail.unshift({
        waypointCode: dpList.vertiportId,
        waypointLat: dpList.vertiportLat,
        waypointLon: dpList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertirpot"
      });

      corridorDetail.corridorDetail.push({
        waypointCode: dnList.vertiportId,
        waypointLat: dnList.vertiportLat,
        waypointLon: dnList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertirpot"
      });
    }

    //출발,도착버티포트 코드
    let cloneObj = cloneDeep(corridorDetail)
    cloneObj.departure = dpList.vertiportId
    cloneObj.destination = dnList.vertiportId
    cloneObj.corridorDetail.forEach((item, index) => {
      item.waypointIndex = index + 1; // 1부터 시작하는 값 설정
    });
    console.log('save: ', cloneObj);

    // await updateCorridorDetail();

    // corridorDetail.departure = vertiportList.find(ind=>ind.id===corridorDetail.departure);
    // corridorDetail.destination = vertiportList.find(ind=>ind.id===corridorDetail.destination);
    // corridorDetail.corridorDetail = corridorDetail.corridorDetail.filter(ind=>ind.pointType==='waypoint');

    hideLoading();
    initPage();
  }

  const updateCorridorDetail = async() => {
    let result = await apiService.updateCorridorDetail(corridorDetail);
    isModalOK = true;
    if(result === 200) {
      modalMsg = "수정 되었습니다.";
    }else{
      modalMsg = result;
    }
    openModal();
  }

  const openWaypointPop = () => {
    useWaypointStore.setState((state)=>({
      ...state,
      isOpenWaypointPop: !state.isOpenWaypointPop 
    }));
  }

  const list = () => {
    navigate('/corridor/list');
  }

  const allCheck = (event) => {
    if(event.target.checked){
      chkWaypoint.forEach(element => {
        element.checked = true;
      });
    }else{
      chkWaypoint.forEach(element => {
        element.checked = false;
      });
    }
  }

  const addWaypoints = (arr) => {
  //   console.log("[register] corridorDetail", arr)
    arr.forEach((waypoint) => {
      //form에 없으면 추가
      const index = corridorDetail.corridorDetail.findIndex(
        (item) => item.waypointCode === waypoint.waypointCode
      );
      if(index !== -1) {
        // 기존 항목 업데이트
        corridorDetail.corridorDetail[index] = {
          waypointCode: waypoint.waypointCode,
          waypointAlt: waypoint.waypointAlt,
          waypointLat: waypoint.waypointLat,
          waypointLon: waypoint.waypointLon,
          pointType: "waypoint"
        };
      } else {
        corridorDetail.corridorDetail.push({
          waypointCode: waypoint.waypointCode,
          waypointAlt: waypoint.waypointAlt,
          waypointLat: waypoint.waypointLat,
          waypointLon: waypoint.waypointLon,
          pointType: "waypoint"
        });
      }
    });
    openWaypointPop();
    hideCorridors();
    makeCorridors("addWaypoints");
  }

  const selectVertiport = (e, key) => {
    hideCorridors();
    hideVertiport();
    handleChange(e, key)
  }

  const makeCorridors = (call) => {
    console.log("[makeCorridors]", call, corridorDetail.departure, corridorDetail.destination)
    let makeCorridor = [...corridorDetail.corridorDetail];
    if(corridorDetail.departure){
      makeCorridor.unshift({
        waypointCode: dpList.vertiportId,
        waypointLat: dpList.vertiportLat,
        waypointLon: dpList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertiport"
      });
    }
    if(corridorDetail.destination){
      makeCorridor.push({
        waypointCode: dnList.vertiportId,
        waypointLat: dnList.vertiportLat,
        waypointLon: dnList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertiport"
      });
    }
    // console.log("[makeCorridors]", makeCorridor)
    if(makeCorridor.length>1) {
      drawCorridors([{
        "corridorCode": corridorDetail.corridorCode,
        "corridorName": corridorDetail.corridorName,
        "departure": dpList,
        "destination": dnList,
        "corridorDetail": makeCorridor,
      }], null, true)
    }
  }

  const deleteWaypoint = () =>{
    hideCorridors();
    hideVertiport();
    let temp = [];
    chkWaypoint.current.filter(ind=>ind).forEach((ind,i) => {
      if(!ind.checked) {
        temp.push(corridorDetail.corridorDetail[i])
      }
    });
    chkWaypoint.current.forEach((checkbox) => {
      if (checkbox) checkbox.checked = false;
    });
    setdpList(null);
    setdnList(null);
    setcorridorDetail({
      ...corridorDetail,
      corridorDetail: temp,
    });
  }

  const checkMove = (evt) => {
    hideCorridors();
    makeCorridors("checkMove");
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
    setcorridorDetail({
      ...corridorDetail,
      [key]: event.target.value,
    });
  };

  return (
    <div className="wrap-list" >
      <div className="title">회랑 수정</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tbody>
            <tr>
              <td>ID</td><td><input type="text" value={corridorDetail.corridorCode || ""} readOnly /></td>
            </tr>
            <tr>
              <td>이름</td><td><input type="text" value={corridorDetail.corridorName || ""} onChange={(e)=>handleChange(e,'corridorName')} /></td>
            </tr>
            <tr>
              <td>Width(NM)</td><td><input type="text" value={corridorDetail.width || ""} onChange={(e)=>handleChange(e,'width', true)} /></td>
            </tr>
            <tr>
              <td>Height(FT)</td><td><input type="text" value={corridorDetail.height || ""} onChange={(e)=>handleChange(e,'height', true)} /></td>
            </tr>
            <tr>
              <td>비행허용량</td><td><input type="text" value={corridorDetail.maximumFlightCapacity || ""} onChange={(e)=>handleChange(e,'maximumFlightCapacity', true)} /></td>
            </tr>
            <tr>
              <td>출발 버티포트</td>
              <td>
                <select value={corridorDetail.departure} onChange={(e)=>selectVertiport(e,'departure')}>
                {vertiportList.map((item, index) => (
                  <option key={index} value={item.vertiportId}>
                    {item.vertiportId}
                  </option>
                ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>도착 버티포트</td>
              <td>
                <select value={corridorDetail.destination} onChange={(e)=>selectVertiport(e,'destination')}>
                {vertiportList.map((item, index) => (
                  <option key={index} value={item.vertiportId}>
                    {item.vertiportId}
                  </option>
                ))}
                </select>
              </td>
            </tr>
            </tbody>
          </table>
          <table className="fs">
          <tbody>
            <tr>
              <td className="fs_sub">
                { corridorDetail.corridorCode }({ corridorDetail.corridorDetail?.length })
                <button className="add" onClick={deleteWaypoint}>delete</button>
                <button className="add" onClick={openWaypointPop}>add</button></td>
            </tr>
            <tr>
              <td>
                <table className="fs_head" >
                  <thead>
                    <tr>
                      <td><input type="checkbox" onClick={(e)=>allCheck(e)} /></td>
                      <td>WAYPOINT</td>
                      <td>고도</td>
                      <td>위도</td>
                      <td>경도</td>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <draggable value={corridorDetail.corridorDetail" :sort="true} onChange={checkMove"> */}
                    {corridorDetail.corridorDetail?.map(( item, index ) => (
                      <tr key={index} className="drag-handle">
                        <td><input type="checkbox" ref={(el) => (chkWaypoint.current[index] = el)} /></td>
                        <td><input type="text" value={item.waypointCode || ""} readOnly /></td>
                        <td><input type="text" value={item.waypointAlt || ""} readOnly /></td>
                        <td><input type="text" value={item.waypointLat || ""} readOnly /></td>
                        <td><input type="text" value={item.waypointLon || ""} readOnly /></td>
                      </tr>
                    ))}
                    {/* // </draggable> */}
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
        <button onClick={save}>저장</button>
        <button onClick={list}>목록</button>
      </div>
    </div>
    // <WaypointPopup v-if="isOpenWaypointPop" :isOpen="isOpenWaypointPop" :list="corridorDetail.corridorDetail" @addWaypoints="addWaypoints" />
  )
}
