import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useCorridorStore from "../../stores/corridor";
import useModalStore from "../../stores/modal";
import useVertiportStore from "../../stores/vertiport";
import useMapStore from "../../stores/map";
import BaseMap from "../../components/BaseMap";
import UtilFunc from "../../utils/functions";

export default function Register() {
  const [formData, setFormData] = useState({
    "corridorCode": "",
    "corridorName": "",
    "departure": "",
    "destination": "",
    "width": "",
    "height": "",
    "maximumFlightCapacity": null,
    "otherinformation": "",
    "corridorPolygon": [],
    "corridorDetail": [],
    "corridorLinkPolygon": null
  });

  const { actions: {
    showLoading, 
    hideLoading
  }} = useModalStore();

  const { actions: {
    getVertiportList,
  }, vertiportList} = useVertiportStore();

  const { actions: {
    getCorridorList
  }} = useCorridorStore();

  const handleChangeVertiport = (e) => {
    console.log('handleChangeVertiport: ', e);
  }

  useEffect(async()=> {
    showLoading();
    await getVertiportList(null, {srchType: "", srchValue: ""}); // TODO : searchType, value 상태관리 추가
    hideLoading();
  }, []);

  const save = () => {

  }

  const list = () => {

  }

  const deleteWaypoint = () => {

  }

  const openWaypointPop = () => {

  }

  const allCheck = () => {
    
  }

  return (
    <div className="wrap-list">
      <div className="title">회랑 등록</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tr>
              <td>CORRIDOR</td>
              <td><input type="text" value={formData.corridorCode} /></td>
            </tr>
            <tr>
              <td>이름</td>
              <td><input type="text" value={formData.corridorName} /></td>
            </tr>
            <tr>
              <td>Width(NM)</td>
              <td><input type="text" value={formData.width} onInput={UtilFunc.handleKeydownFloat} /></td>
            </tr>
            <tr>
              <td>Height(FT)</td>
              <td><input type="text" value={formData.height} onInput={UtilFunc.handleKeydownFloat} /></td>
            </tr>
            <tr>
              <td>비행허용량</td>
              <td><input type="text" value={formData.maximumFlightCapacity} onInput={UtilFunc.handleKeydownFloat} /></td>
            </tr>
            <tr>
              <td>출발 버티포트</td>
              <td>
                <select value={formData.departure} onChange={handleChangeVertiport}>
                  <option value="">== Select ==</option>
                  {vertiportList.map((item, index)=>
                    (<option key={index} value={item}>{item.vertiportId}</option>)
                  )}
                </select>
              </td>
            </tr>
            <tr>
              <td>도착 버티포드</td>
              <td>
                <select value={formData.destination} onChange={handleChangeVertiport}>
                  <option value="">== Select ==</option>
                  {vertiportList.map((item, index)=>(
                    <option key={index} value={item}>{item.vertiportId}</option>
                  ))}
                </select></td>
            </tr>
          </table>
          <table className="fs">
            <tr>
              <td className="fs_sub">
                {formData.corridorCode}({formData.corridorDetail.length})
                <button className="add" onClick={deleteWaypoint}>delete</button>
                <button className="add" onClick={openWaypointPop}>add</button>
              </td>
            </tr>
            <tr>
              <td>
                <table className="fs_head">
                  <thead>
                    <tr>
                      <td><input type="checkbox" onClick={allCheck} /></td>
                      <td>WAYPOINT</td>
                      <td>고도</td>
                      <td>위도</td>
                      <td>경도</td>
                    </tr>
                  </thead>
                  <tbody>

                  </tbody>
                </table>
              </td>
            </tr>
          </table>
        </div>
        <BaseMap />
      </div>  
      <div className="wrap-reg">
        <button onClick={save}>저장</button>
        <button onClick={list}>목록</button>
      </div>
    </div>
  )
}