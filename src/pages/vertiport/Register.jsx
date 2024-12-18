import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UtilFunc from "../../utils/functions";
import useMapStore from "../../stores/map";
import BaseMap from "../../components/BaseMap";

export default function Register() {
  const navigate = useNavigate();
  
  const {
    actions: { showVertiport },
  } = useMapStore();

  const [formData, setFormData] = useState({
    vertiportName: "",
    vertiportId: "",
    vertiportKind: "",
    vertiportCallsign: "",
    vertiportFrequency: "",
    vertiportBandwidth: "",
    vertiportChannel: "",
    vertiportHeight: "",
    vertiportHeightCriteria: "AGL",
    vertiportDirection: "FATO 36 / 18",
    vertiportLat: 37.564293,
    vertiportLon: 126.623,
    vertiportAddress: "",
    fatoinfo: [],
    standinfo: [],
  });

  const handleInputChange = (type, value, index = null, mode = null) => {
    setFormData((prev) => {
      // `fatoinfo`나 `standinfo`를 처리하는 경우
      if (index !== null && mode) {
        const updatedArray = prev[mode].map((item, i) =>
          i === index ? { ...item, [type]: value } : item
        );

        return {
          ...prev,
          [mode]: updatedArray,
        };
      }

      // 단순 필드 업데이트
      return {
        ...prev,
        [type]: value,
      };
    });
  };

  const handleAddRow = (mode) => {
    if(mode=='fato'){
      setFormData((prev) => ({
        ...prev,
        fatoinfo: [
          ...prev.fatoinfo, // 기존 배열 복사
          {
            fatoCode: "",
            fatoLat: "",
            fatoLon: "",
          }, // 새로운 객체 추가
        ],
      }));

      // setTimeout(() => {
      //   fatoEl.value.scrollTop = fatoEl.value.offsetHeight + fatoEl.value.scrollHeight;
      // }, 1);
    }else{
      setFormData((prev)=>({
        ...prev, 
        standinfo: [
          ...prev.standinfo,
          {
            standCode: "",
            standLat: "",
            standLon: ""
          }
        ]
      }));

      // setTimeout(() => {
      //   standEl.value.scrollTop = standEl.value.offsetHeight + standEl.value.scrollHeight;
      // }, 1);
    }
  }

  const handleRemoveRow = (mode, index) => {
    if(mode=='fato'){
      setFormData((prev) => ({...prev, fatoinfo: prev.fatoinfo.filter((_, i) => i !== index)}));
    }else{
      setFormData((prev) => ({...prev, standinfo: prev.standinfo.filter((_, i) => i !== index)}));
    }
  }

  const checkVertiport = (event) => {
    let lat = Number(formData.vertiportLat);
    let lon = Number(formData.vertiportLon);
    if (event.key != "." && lat > 0 && lon > 0) {
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

  const save = () => {

  }

  return (
    <div className="wrap-list">
      <div className="title">버티포트 등록</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <thead>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportId}
                    onChange={(e) =>
                      handleInputChange("vertiportId", e.target.value)
                    }
                    onKeyUp={checkVertiport}
                  />
                </td>
              </tr>
              <tr>
                <td>이름</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportName}
                    onChange={(e) =>
                      handleInputChange("vertiportName", e.target.value)
                    }
                    onKeyUp={checkVertiport}
                  />
                </td>
              </tr>
              <tr>
                <td>종류</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportKind}
                    onChange={(e) =>
                      handleInputChange("vertiportKind", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>CALLSIGN</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportCallsign}
                    onChange={(e) =>
                      handleInputChange("vertiportCallsign", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>통신채널</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportChannel}
                    onChange={(e) =>
                      handleInputChange("vertiportChannel", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownNumber}
                  />
                </td>
              </tr>
              <tr>
                <td>이착륙 방향</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportDirection}
                    onChange={(e) =>
                      handleInputChange("vertiportDirection", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>주소</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportAddress}
                    onChange={(e) =>
                      handleInputChange("vertiportAddress", e.target.value)
                    }
                  />
                </td>
              </tr>
            </thead>
          </table>
          <table className="mini">
            <tbody>
              <tr>
                <td>주파수</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportFrequency}
                    onChange={(e) =>
                      handleInputChange("vertiportFrequency", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
                <td>대역폭</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportBandwidth}
                    onChange={(e) =>
                      handleInputChange("vertiportBandwidth", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
              </tr>
              <tr>
                <td>높이</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportHeight}
                    onChange={(e) =>
                      handleInputChange("vertiportHeight", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownFloat}
                  />
                </td>
                <td>높이기준</td>
                <td>
                  <select
                    value={formData.vertiportHeightCriteria}
                    onChange={(e) => {
                      handleInputChange(
                        "vertiportHeightCriteria",
                        e.target.value
                      );
                    }}
                  >
                    <option value={"AGL"}>AGL(지표면기준)</option>
                    <option value={"MSL"}>MSL(평균해수면기준)</option>
                    <option value={"AMSL"}>AMSL(?)</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>위도</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportLat}
                    onChange={(e) =>
                      handleInputChange("vertiportLat", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownFloat}
                    onKeyUp={checkVertiport}
                  />
                </td>
                <td>경도</td>
                <td>
                  <input
                    type="text"
                    value={formData.vertiportLon}
                    onChange={(e) =>
                      handleInputChange("vertiportLon", e.target.value)
                    }
                    onInput={UtilFunc.handleKeydownFloat}
                    onKeyUp={checkVertiport}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <table className="fs">
            <tr>
              <td>FATO ({formData.fatoinfo.length}) <button className="add" onClick={()=>handleAddRow('fato')}>add</button></td>
              <td>STAND ({formData.standinfo.length}) <button className="add" onClick={()=>handleAddRow('stand')}>add</button></td>
            </tr>
            <tr>
              <td>
                <table className="fs_head">
                  <thead>
                    <tr>
                      <td>코드</td>
                      <td>위도</td>
                      <td>경도</td>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {formData.fatoinfo.map((item, index)=>(
                      <tr key={index}>
                        <td><input type="text" value={item.fatoCode} onChange={(e)=>handleInputChange('fatoCode', e.target.value, index, 'fatoinfo')} /></td>
                        <td><input type="text" value={item.fatoLat} onChange={(e)=>handleInputChange('fatoLat', e.target.value, index, 'fatoinfo')} onInput={UtilFunc.handleKeydownFloat}/></td>
                        <td><input type="text" value={item.fatoLon} onChange={(e)=>handleInputChange('fatoLon', e.target.value, index,'fatoinfo')} onInput={UtilFunc.handleKeydownFloat}/></td>
                        <td><button className="remove" onClick={()=>handleRemoveRow('fato', index)}>-</button></td>
                      </tr>
                    ))}
                    
                  </tbody>
                </table>
              </td>
              <td>
                <table className="fs_head">
                  <thead>
                    <tr>
                      <td>코드</td>
                      <td>위도</td>
                      <td>경도</td>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.standinfo.map((item, index)=>(
                      <tr key={index}>
                        <td><input type="text" value={item.standCode} onChange={(e)=>handleInputChange('standCode', e.target.value, index, 'standinfo')} /></td>
                        <td><input type="text" value={item.standLat} onChange={(e)=>handleInputChange('standLat', e.target.value, index, 'standinfo')} onInput={UtilFunc.handleKeydownFloat}/></td>
                        <td><input type="text" value={item.standLon} onChange={(e)=>handleInputChange('standLon', e.target.value, index, 'standinfo')} onInput={UtilFunc.handleKeydownFloat}/></td>
                        <td><button className="remove" onClick={()=>handleRemoveRow('stand', index)}>-</button></td>
                      </tr>
                    ))}
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
  );
}
