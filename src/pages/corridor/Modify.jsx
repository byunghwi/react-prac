import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';
import useSettingStore from "../../stores/setting";
import useMapStore from "../../stores/map";
import useWaypointStore from "../../stores/waypoint";

import UtilFunc from "../../utils/functions";
import BaseMap from "../../components/BaseMap"
import WaypointPopup from "../../components/WaypointPopup"
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import cloneDeep from 'lodash';
import cloneDeep from 'lodash/cloneDeep';

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


export default function List() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading, openModal } = useModalStore();
  const { drawCorridors, hideCorridors, hideVertiport, corridorDetail, setcorridorDetail } = useMapStore();
  const { allWaypoints, isOpenWaypointPop } = useWaypointStore();

  const [vertiportList, setvertiportList] = useState([]);
  const [dpList, setdpList] = useState(null);
  const [dnList, setdnList] = useState(null);

  useEffect(() => {
    initPage();
  },[id])

  useEffect(() => {
    if(corridorDetail.corridorDetail && vertiportList.length > 0){
      console.log("[vertiportList,corridorDetail]", corridorDetail.departure, corridorDetail.destination, corridorDetail.corridorDetail?.length)
      let dp = vertiportList.find(ind=>ind.vertiportId===corridorDetail.departure);
      let dn = vertiportList.find(ind=>ind.vertiportId===corridorDetail.destination);
      setdpList({...dp});
      setdnList({...dn});
      setcorridorDetail(corridorDetail);
    }
  },[vertiportList,corridorDetail])

  useEffect(() => {
    console.log("useEffect[dnList, dpList]")
    if(typeof (corridorDetail.departure) === "string" && typeof (corridorDetail.destination) === "string" && dnList && dpList){
      console.log("[dnList, dpList]", corridorDetail.departure, dpList)
      makeCorridors("watch");
    }
  },[dnList, dpList])

  const SortableRow = ({ item, onCheckboxChange }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: item.waypointCode });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: "#fff",
      padding: "10px",
      borderBottom: "1px solid #ddd",
      display: "table-row",
    };

    return (
      <tr
      ref={setNodeRef}
      style={style}
      >
        <td><input type="checkbox" checked={item.checked} onChange={(e) => onCheckboxChange(item.waypointCode)} /></td>
        <td {...attributes} {...listeners} style={{ cursor: "grab" }}><input type="text" value={item.waypointCode || ""} readOnly /></td>
        <td {...attributes} {...listeners} style={{ cursor: "grab" }}><input type="text" value={item.waypointAlt || ""} readOnly /></td>
        <td {...attributes} {...listeners} style={{ cursor: "grab" }}><input type="text" value={item.waypointLat || ""} readOnly /></td>
        <td {...attributes} {...listeners} style={{ cursor: "grab" }}><input type="text" value={item.waypointLon || ""} readOnly /></td>
      </tr>
    );
  };

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
        response.corridorDetail = response.corridorDetail.filter(ind=>ind.pointType==='waypoint').map(ind=>{
          ind.checked=false;
          return ind;
        })
        setcorridorDetail(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const save = async() => {
    showLoading();
    //출발,도착버티포트 코드
    let cloneObj = cloneDeep(corridorDetail)
    cloneObj.departure = dpList.vertiportId;
    cloneObj.destination = dnList.vertiportId;
    if(cloneObj.corridorDetail) {
      cloneObj.corridorDetail.unshift({
        waypointCode: dpList.vertiportId,
        waypointLat: dpList.vertiportLat,
        waypointLon: dpList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertirpot"
      });
      cloneObj.corridorDetail.push({
        waypointCode: dnList.vertiportId,
        waypointLat: dnList.vertiportLat,
        waypointLon: dnList.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertirpot"
      });
    }
    cloneObj.corridorDetail.forEach((item, index) => {
      item.waypointIndex = index + 1; // 1부터 시작하는 값 설정
    });
    // console.log('save: ', cloneObj.corridorDetail[1]);
    await updateCorridorDetail(cloneObj);
    hideLoading();
    initPage();
  }

  const updateCorridorDetail = async(data) => {
    let result = await apiService.updateCorridorDetail(data);
    if(result === 200) {
      openModal("","수정 되었습니다.",true);
    }else{
      openModal("",result,true);
    }
  }

  const openWaypointPop = () => {
    useWaypointStore.setState((state)=>({
      ...state,
      isOpenWaypointPop: !state.isOpenWaypointPop
    }));
    console.log("[open] corridorDetail", corridorDetail.corridorDetail.length)
  }

  const list = () => {
    navigate('/corridor/list');
  }

  const allCheck = (event) => {
    const isChecked = event.target.checked;
    setcorridorDetail({
      ...corridorDetail,
      corridorDetail: corridorDetail.corridorDetail.map((item) => ({
        ...item,
        checked: isChecked,
      })),
    });
  }

  const handleCheckboxChange = (id) => {
    setcorridorDetail({
      ...corridorDetail,
      corridorDetail: corridorDetail.corridorDetail.map((item) =>
        item.waypointCode === id
          ? { ...item, checked: !item.checked }
          : item
      ),
    });
  };

  const addWaypoints = (arr) => {
    console.log("[addWaypoints] corridorDetail", arr)
    let addObj = [];
    arr.forEach((waypoint) => {
      //form에 없으면 추가
      const index = corridorDetail.corridorDetail.findIndex(
        (item) => item.waypointCode === waypoint.waypointCode
      );
      if(index !== -1) {
        // 기존 항목 업데이트
        let temp = [...corridorDetail.corridorDetail];
        temp[index] = {
          waypointCode: waypoint.waypointCode,
          waypointAlt: waypoint.waypointAlt,
          waypointLat: waypoint.waypointLat,
          waypointLon: waypoint.waypointLon,
          pointType: "waypoint"
        };
        setcorridorDetail({
          ...corridorDetail,
          corridorDetail: temp,
        });
      } else {
        addObj.push({
          waypointCode: waypoint.waypointCode,
          waypointAlt: waypoint.waypointAlt,
          waypointLat: waypoint.waypointLat,
          waypointLon: waypoint.waypointLon,
          pointType: "waypoint"
        });
        // setcorridorDetail(temp);
      }
    });
    if(addObj.length > 0) {
      setcorridorDetail({
        ...corridorDetail,
        corridorDetail: [...corridorDetail.corridorDetail,...addObj],
      });
    }
    openWaypointPop();
    hideCorridors();
  }

  const selectVertiport = (e, key) => {
    hideCorridors();
    hideVertiport();
    handleChange(e, key)
  }

  const makeCorridors = (call) => {
    console.log("[makeCorridors]", call, corridorDetail.departure, corridorDetail.destination, corridorDetail.corridorDetail.length)
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
    console.log("[makeCorridors]", makeCorridor)
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
    corridorDetail.corridorDetail.forEach((ind,i) => {
      if(!ind.checked) {
        temp.push(corridorDetail.corridorDetail[i])
      }
    });
    corridorDetail.corridorDetail.forEach((checkbox) => {
      if (checkbox) checkbox.checked = false;
    });
    // setdpList(null);
    // setdnList(null);
    setcorridorDetail({
      ...corridorDetail,
      corridorDetail: temp,
    });
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

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = corridorDetail.corridorDetail.findIndex(
        (item) => item.waypointCode === active.id
      );
      const newIndex = corridorDetail.corridorDetail.findIndex(
        (item) => item.waypointCode === over.id
      );
      const updatedList = arrayMove(
        corridorDetail.corridorDetail,
        oldIndex,
        newIndex
      );
      setcorridorDetail({
        ...corridorDetail,
        corridorDetail: updatedList,
      });
      hideCorridors();
    }
  };

  return (
    <>
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} >
                <SortableContext items={corridorDetail.corridorDetail?.map((item) => item.waypointCode) || []}>
                <table className="fs_head_c" >
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
                    {corridorDetail.corridorDetail?.map(( item, index ) => (
                      <SortableRow key={item.waypointCode} item={item} onCheckboxChange={handleCheckboxChange} />
                    ))}
                  </tbody>
                </table>
                </SortableContext>
                </DndContext>
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
    {isOpenWaypointPop && (
      <WaypointPopup
        isOpen={isOpenWaypointPop}
        list={corridorDetail.corridorDetail}
        addWaypoints={addWaypoints} // 이벤트를 콜백으로 전달
      />
    )}
    </>
  )
}

