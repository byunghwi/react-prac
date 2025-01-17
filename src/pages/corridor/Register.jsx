import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useCorridorStore from "../../stores/corridor";
import useModalStore from "../../stores/modal";
import useVertiportStore from "../../stores/vertiport";
import useMapStore from "../../stores/map";
import BaseMap from "../../components/BaseMap";
import UtilFunc from "../../utils/functions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Register() {
  const [formData, setFormData] = useState({
    corridorCode: "",
    corridorName: "",
    departure: "",
    destination: "",
    width: "",
    height: "",
    maximumFlightCapacity: 0,
    otherinformation: "",
    corridorPolygon: [],
    corridorDetail: [],
    corridorLinkPolygon: null,
  });

  const { showLoading, hideLoading } = useModalStore();

  const {
    actions: { getVertiportList },
    vertiportList,
  } = useVertiportStore();

  const {
    actions: { getCorridorList },
  } = useCorridorStore();

  const { actions: { hideCorridors, hideVertiports, drawCorridors }} = useMapStore();

  useEffect(() => {
    async function fetchData() {
      try {
        showLoading();
        await getVertiportList(null, { srchType: "", srchValue: "" }); // TODO : searchType, value 상태관리 추가
        hideLoading();
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.departure || formData.destination) {
      makeCorridors();
    }
  }, [formData.departure, formData.destination]);

  const handleChangeVertiport = (type, target) => {
    if(type == 'departure') {
      setFormData((prev)=>({...prev, departure : target }));
    } else {
      setFormData((prev)=>({...prev, destination: target }));
    }
    hideCorridors();
    hideVertiports();
  }

  const save = () => {};

  const list = () => {};

  const deleteWaypoint = () => {};

  const openWaypointPop = () => {};

  const allCheck = () => {};

  const checkMove = () => {};

  const handleInputChange = () => {};

  const handleDragEnd = () => {};

  const makeCorridors = () => {
    let makeCorridor = [...formData.corridorDetail];
    if(formData.departure){
      makeCorridor.unshift({
        waypointCode: formData.departure.vertiportId,
        waypointLat: formData.departure.vertiportLat,
        waypointLon: formData.departure.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertiport"
      });
    }
    if(formData.destination){
      makeCorridor.push({
        waypointCode: formData.destination.vertiportId,
        waypointLat: formData.destination.vertiportLat,
        waypointLon: formData.destination.vertiportLon,
        waypointAlt: "없음",
        pointType: "vertiport"
      });
    }
    if(makeCorridor.length>1) {
      drawCorridors([{
        "corridorCode": formData.corridorCode,
        "corridorName": formData.corridorName,
        "departure": formData.departure,
        "destination": formData.destination,
        "corridorDetail": makeCorridor,
      }], null, true)
    }
  }

  return (
    <div className="wrap-list">
      <div className="title">회랑 등록</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tbody>
              <tr>
                <td>CORRIDOR</td>
                <td>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={formData.corridorCode}
                  />
                </td>
              </tr>
              <tr>
                <td>이름</td>
                <td>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={formData.corridorName}
                  />
                </td>
              </tr>
              <tr>
                <td>Width(NM)</td>
                <td>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={formData.width}
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
              </tr>
              <tr>
                <td>Height(FT)</td>
                <td>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={formData.height}
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
              </tr>
              <tr>
                <td>비행허용량</td>
                <td>
                  <input
                    type="text"
                    onChange={handleInputChange}
                    value={formData.maximumFlightCapacity}
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
              </tr>
              <tr>
                <td>출발 버티포트</td>
                <td>
                  <select
                    value={formData.departure?.vertiportId || ""}
                    onChange={(e)=>{
                      const selectedVertiport = vertiportList.find(
                        (item) => item.vertiportId === e.target.value
                      );
                      handleChangeVertiport("departure", selectedVertiport);
                    }}
                  >
                    <option value="">== Select ==</option>
                    {vertiportList.map((item, index) => (
                      <option key={index} value={item.vertiportId}>
                        {item.vertiportId}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td>도착 버티포드</td>
                <td>
                  <select
                    value={formData.destination?.vertiportId || ""}
                    onChange={(e)=>{
                      const selectedVertiport = vertiportList.find(
                        (item) => item.vertiportId === e.target.value
                      );
                      handleChangeVertiport("destination", selectedVertiport);
                    }}
                  >
                    <option value="">== Select ==</option>
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
            <thead>
              <tr>
                <td className="fs_sub">
                  {formData.corridorCode}({formData.corridorDetail.length})
                  <button className="add" onClick={deleteWaypoint}>
                    delete
                  </button>
                  <button className="add" onClick={openWaypointPop}>
                    add
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <table className="fs_head">
                    <thead>
                      <tr>
                        <td>
                          <input type="checkbox" onClick={allCheck} />
                        </td>
                        <td>WAYPOINT</td>
                        <td>고도</td>
                        <td>위도</td>
                        <td>경도</td>
                      </tr>
                    </thead>
                      {/* <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="waypoints">
                        {(provided) => (
                          <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {formData.corridorDetail.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                  <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="react-draggable"
                                  >
                                    <td><input type="checkbox" /></td>
                                    <td><input type="text" value={item.waypointCode} readOnly /></td>
                                    <td><input type="text" value={item.waypointAlt} readOnly /></td>
                                    <td><input type="text" value={item.waypointLat} readOnly /></td>
                                    <td><input type="text" value={item.waypointLon} readOnly /></td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </DragDropContext> */}
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
  );
}
