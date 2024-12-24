import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Modify() {
  return (
    <div className="wrap-list">
      <div className="title">버티포트 수정</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tr>
              <td>ID</td><td><input type="text" value={vertiportDetail.vertiportId} onChange={(e)=>handleInputChange("vertiportId", e.target.value)} readonly /></td>
            </tr>
            <tr>
              <td>이름</td><td><input type="text" value={vertiportDetail.vertiportName} onChange={(e)=>handleInputChange("vertiportName", e.target.value)} onkeyup={checkVertiport} /></td>
            </tr>
            <tr>
              <td>종류</td><td><input type="text" value={vertiportDetail.vertiportKind} onChange={(e)=>handleInputChange("vertiportKind", e.target.value)} /></td>
            </tr>
            <tr>
              <td>CALLSIGN</td><td><input type="text" value={vertiportDetail.vertiportCallsign} onChange={(e)=>handleInputChange("vertiportKind", e.target.value)} /></td>
            </tr>
            <tr>
              <td>통신채널</td><td><input type="text" value={vertiportDetail.vertiportChannel} onChange={(e)=>handleInputChange("vertiportChannel", e.target.value)} onInput={UtilFunc.handleKeydownNumber} /></td>
            </tr>
            <tr>
              <td>이착륙 방향</td><td><input type="text" value={vertiportDetail.vertiportDirection} onChange={(e)=>handleInputChange("vertiportDirection", e.target.value)} onInput={UtilFunc.handleKeydownNumber} /></td>
            </tr>
            <tr>
              <td>주소</td><td><input type="text" value={vertiportDetail.vertiportAddress} onChange={(e)=>handleInputChange("vertiportAddress", e.target.value)} /></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}
