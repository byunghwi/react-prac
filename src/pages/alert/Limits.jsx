import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';

export default function AlertLimits() {

  const { showLoading, hideLoading, openModal } = useModalStore();

  const [currentTime, setCurrentTime] = useState();
  const [geoList, setGeoList] = useState([]);
  const [collisionList, setCollisionList] = useState([]);

  useEffect(() => {
    initLimit();
  },[])

  const formattedTime = useMemo(() => {
    return currentTime ? dayjs(currentTime).format('YYYY-MM-DD HH:mm:ss') : '';
  });

  const initLimit = async () => {
    showLoading();
    let result = await apiService.loadLimitList();
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
    hideLoading();
  };

  const modify = async() => {
    showLoading();
    let result = [...geoList, ...collisionList]
    let response = await apiService.modifyLimit(result);
    if(response.status === 200) {
      openModal('경보 임계치 설정','저장 되었습니다.',true);
    }else{
      openModal('경보 임계치 설정',response,true);
    }
    hideLoading();
    initLimit();
  }

  const handleDistance = (type, index, e) => {
    const inputValue = e.target.value;
    // 숫자와 소수점만 허용하는 정규식
    if (/^\d*\.?\d*$/.test(inputValue)) {
      const updateList = type === "geo" ? [...geoList] : [...collisionList];
      updateList[index] = { ...updateList[index], distance: inputValue };
      type === "geo" ? setGeoList(updateList) : setCollisionList(updateList);
    }
  };

  return (
    <div className="wrap-list" >
      <div className="title-bar">
        <div className="title">경보 임계치 설정</div>
        <div className="set-time">최근 변경 일시: { formattedTime }</div>
      </div>
      <div className="wrap-map">
        <div className="wrap-table-limit">
          <p>충돌 임계치</p>
          <table className="">
            <thead>
              <tr>
                <td>등급</td>
                <td>거리</td>
              </tr>
            </thead>
            <tbody>
              {collisionList.map(( item, index ) => (
                <tr key={index}>
                  <td>{ item.limitLevel }</td>
                  <td>
                    <input
                      type="text"
                      value={item.distance}
                      onChange={(e) => handleDistance('collision', index, e)}
                      placeholder="숫자와 소수점만 입력하세요"
                    />
                    NM 이하 근접
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wrap-table-limit">
          <p>지오펜스 침범 임계치</p>
          <table className="">
            <thead>
              <tr>
                <td>등급</td>
                <td>거리</td>
              </tr>
            </thead>
            <tbody>
              {geoList.map(( item, index ) => (
                <tr key={index}>
                  <td>{ item.limitLevel }</td>
                  <td>
                    <input type="text"
                      value={item.distance}
                      onChange={(e) => handleDistance('geo', index, e)}
                      placeholder="숫자와 소수점만 입력하세요"/>
                    NM 이하 근접
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="wrap-reg">
          <button onClick={modify}>저장</button>
        </div>
    </div>
  )

}


