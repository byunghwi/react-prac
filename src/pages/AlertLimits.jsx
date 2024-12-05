import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import useWarningStore from "../stores/warning";
import "../styles/warning.css";

export default function AlertLimits() {
  const storeWarning = useWarningStore();
  const { getLimitList, modifyLimit } = storeWarning;

  const [currentTime, setCurrentTime] = useState();
  const [geoList, setGeoList] = useState([]);
  const [collisionList, setCollisionList] = useState([]);

  useEffect(() => {
    initLimit();
  }, []);

  const formattedTime = useMemo(() => {
    return dayjs(currentTime).format("YYYY-MM-DD HH:mm:ss");
  }, [currentTime]);

  const initLimit = async () => {
    try {
      let result = await getLimitList();
      if (result) {
        setGeoList(result.filter((ind) => ind.limitType == "G"));
        setCollisionList(result.filter((ind) => ind.limitType == "T"));
        setCurrentTime(
          result.reduce((latest, currentitem) => {
            return new Date(currentitem.updateAt) > new Date(latest.updateAt)
              ? currentitem
              : latest;
          }).updateAt
        );
      }  
    } catch (error) {
      console.error("Error fetching limit list:", error);
    }
  };

  const handleDistance = (type, index, e) => {
    const inputValue = e.target.value;
    // 숫자와 소수점만 허용하는 정규식
    if (/^\d*\.?\d*$/.test(inputValue)) {
      const updateList = type === "geo" ? [...geoList] : [...collisionList];
      updateList[index] = { ...updateList[index], distance: inputValue };
      type === "geo" ? setGeoList(updateList) : setCollisionList(updateList);
    }
  };

  const handleModify = async() => {
    try {
      let res = await modifyLimit([...geoList, ...collisionList]);
      if(res.status == 200) {
        alert("저장이 완료되었습니다.");
      } else {
        console.log('저장실패 : ', res);
      }
    } catch (error) {
      console.error("Error saving limits:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <>
      <div className="wrap-list">
        <div className="title-bar">
          <div className="title">경보 임계치 설정</div>
          <div className="set-time">최근 변경 일시: {formattedTime}</div>
        </div>
        <div className="wrap-table">
          <p>충돌 임계치</p>
          <table>
            <thead>
              <tr>
                <td>등급</td>
                <td>거리</td>
              </tr>
            </thead>
            <tbody>
              {collisionList.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.limitLevel}</td>
                    <td>
                      <input
                        type="text"
                        value={item.distance}
                        onChange={(e) => handleDistance('collision', index, e)}
                        placeholder="숫자와 소수점만 입력하세요"
                      />{" "}
                      NM 이하 근접
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="wrap-table">
          <p>지오펜스 침범 임계치</p>
          <table>
            <thead>
              <tr>
                <td>등급</td>
                <td>거리</td>
              </tr>
            </thead>
            <tbody>
              {geoList.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.limitLevel}</td>
                    <td>
                      <input type="text" 
                        value={item.distance} 
                        onChange={(e) => handleDistance('geo', index, e)}
                        placeholder="숫자와 소수점만 입력하세요"/> NM 이하 근접접
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="wrap-reg">
          <button onClick={handleModify}>저장</button>
        </div>
      </div>
    </>
  );
}
