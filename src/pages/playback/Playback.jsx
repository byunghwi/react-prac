import { useState, useEffect, useCallback, useRef } from "react";
import ReactDatePicker from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import BaseMap from "../../components/BaseMap";
import "../../styles/playback.css";
import usePlaybackStore from "../../stores/playback";
import Queue from "../../utils/queue";
import cloneDeep from 'lodash';

export default function Playback() {
  //store
  const { playback_id, isWSMsgRequired, originQueue, wsDroneMarker, 
    actions: { connect, disconnect, loadPlayBack, pausePlayBack, stopPlayBack, setIsWSMsgRequired, removeWsDroneData, pushWsDroneData, setOriginqueue }} = usePlaybackStore();

  //내부
  const [playState, setPlayState] = useState("stop");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("flow");
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [fid, setFid] = useState([]);
  const [startDateTime, setStartDateTime] = useState('2024-12-19 14:31:00');
  const [endDateTime, setEndDateTime] = useState('2024-12-20 14:00:00');
  const [beforeUnloadHandler, setBeforeUnloadHandler] = useState(null);
  const intervalRef = useRef(null); // interval 저장용 ref
  const groupedDataRef = useRef({});
  const nowQueueDataRef = useRef(null);

  useEffect(()=>{
    console.log('마운트 될때만 실행...?');
    setBeforeUnloadHandler(()=>{
      if(playState == 'play' || playState == 'pause') {
        let params = {
          "token_id": playback_id
        }
        stopPlayBack(params);
      }
    });
    window.addEventListener('beforeunload', beforeUnloadHandler);

    connect();

    return () => {
      if(beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler);
      disconnect();
      if(intervalRef.current) clearInterval(intervalRef.current);
      console.log('언마운트 될때 실행...?');
    }
  }, []);
  
  const handlePlay = async(type) => {
    setLoading(true);

    if (type == 'play') {
      let params = {
        "token_id": playback_id,
        "SPEED": replaySpeed,
        "flightPlanIdentifier": fid.filter(fid => fid && fid.trim != ""),
        "STIME": startDateTime ? new Date(startDateTime).toISOString() : '',
        "ETIME": endDateTime ? new Date(endDateTime).toISOString() : '',
        "mode": mode || 'flow'
      }

      console.log(params);
  
      if(mode == 'dump') {
        changeValue(false, type, true)
  
        // 큐에 데이터가 생기기를 기다리기
        const waitForQueue = setInterval(()=>{
          if (originQueue && !originQueue.isEmpty()) {
            clearInterval(waitForQueue);
            console.log('큐에 데이터가 감지됨. 큐 처리 시작');
            processQueue();
          }
        }, 500)
        
        await loadPlayBack(params);
  
      } else {
        let res = await loadPlayBack(params);
        if (res && res == 200) {
          changeValue(false, type, true)
        }
      }
    } else if (type == 'pause') {
      let params = {
        "token_id": playback_id
      }
      if (mode == 'dump') {
        changeValue(false, type, false);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        await pausePlayBack(params);
      } else {
        let res = await pausePlayBack(params);
        if (res && res == 200) {
          changeValue(false, type, false);
        }
      }
    } else if (type == 'stop') {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      nowQueueDataRef.current = null;
      groupedDataRef.current = {};
      setOriginqueue();
  
      let params = {
        "token_id": playback_id,
      }
      let res = await stopPlayBack(params);
      if (res && res == 200) {
        changeValue(false, type, false);
        let fidArr = Object.keys(wsDroneMarker);
        if (fidArr.length > 0) {
          fidArr.forEach((fid) => {
            removeWsDroneData(fid);
          });
        }
      } 
    }
  };

  const changeValue = (loading, playState, wsMsg) => {
    setLoading(loading);
    setPlayState(playState);
    setIsWSMsgRequired(wsMsg);
  }

  // messageDateTime 기준 그룹화
  const groupByMessageDateTime = useCallback((data) => {
    return data.reduce((acc, eachDrone) => {
      const timeKey = new Date(eachDrone.messageDateTime).toISOString().substring(0, 21);
      if (!acc[timeKey]) {
          acc[timeKey] = [];
      }
      acc[timeKey].push(eachDrone);
      return acc;
    }, {});
  });

  const startPlayback = useCallback(() => {
    if (!groupedDataRef.current || Object.keys(groupedDataRef.current).length === 0) {
      return;
    }

    const baseInterval = 100;
    const intervalTime = baseInterval / replaySpeed;

    intervalRef.current = setInterval(() => {
      if (playState === "pause") {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      //현재 시간그룹 데이터 소진 시 새로운 큐데이터 추출
      if (!groupedDataRef.current || Object.keys(groupedDataRef.current).length === 0) {
        nowQueueDataRef.current = null;
        groupedDataRef.current = {};
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        processQueue(); // 새로운 큐 데이터를 가져오기 위해 호출
        return;
      }

      // 현재 시간 그룹 데이터 처리
      const timeKeys = Object.keys(groupedDataRef.current);
      const currentTimeKey = timeKeys[0];
      const currentTimeGroup = groupedDataRef.current[currentTimeKey];
              
      //화면에 그리기
      currentTimeGroup.forEach((droneData) => {
        pushWsDroneData({ result: droneData });
      });

      // 처리한 시간 그룹 제거
      delete groupedDataRef.current[currentTimeKey];
    }, intervalTime);
  }, [playState, replaySpeed]);

  const processQueue = useCallback(() => {
    if(intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!nowQueueDataRef.current) {
      const data = originQueue.dequeue();
      if (!data) {
        console.log("큐에 데이터가 없습니다.");
        return;
      }

      // 최신 값 저장
      groupedDataRef.current = groupByMessageDateTime(data);
      nowQueueDataRef.current = data;
      startPlayback()
    } else {
      startPlayback();
    }
  }, [originQueue, startPlayback]);

  const handleModeChange = (e) => {
    setMode(e.target.value);
  }

  const handleSpeedChange = (e) => {
    setReplaySpeed(e.target.value);
  };

  const handleFidChange = (index, e) => {
    const value = e.target.value.trim();
    setFid((prevFid) => {
      const updatedFid = [...prevFid];
      updatedFid[index] = value; // 해당 인덱스 값 업데이트
      return updatedFid;
    });
  };

  const handleStartDateChange = (date) => {
    setStartDateTime(date);
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(date);
  };
  
  return (
    <div className="wrap-list">
      <div className="title">비행 기록 리뷰</div>
      <div className="wrap-map">
        <BaseMap />
      </div>
      <div className="wrap-reg">
        {/* 재생, 일시정지, 중지 */}
        {
          <>
            {/* 재생 버튼 */}
            {(playState === "stop" || playState === "pause") && (
              <button onClick={() => handlePlay("play")} disabled={loading}>
                ▶
              </button>
            )}

            {/* 일시정지 버튼 */}
            {playState === "play" && (
              <button onClick={() => handlePlay("pause")} disabled={loading}>
                ⏸
              </button>
            )}

            {/* 중지 버튼 */}
            {(playState === "play" || playState === "pause") && (
              <button onClick={() => handlePlay("stop")} disabled={loading}>
                ⏹
              </button>
            )}
          </>
        }

        {/* flow/dump 선택 */}
        <select onChange={handleModeChange} disabled={loading || playState!='stop' }>
          <option value="flow">flow</option>
          <option value="dump">dump</option>
        </select>

        {/* 배속 선택 */}
        <select onChange={handleSpeedChange}>
          <option value="1">x1</option>
          <option value="2">x2</option>
          <option value="4">x4</option>
        </select>

        {/* fid 입력 */}
        1 fid: <input
          type="text"
          onChange={(e)=>handleFidChange(0,e)}
          placeholder="flightPlanIdentifier"
          value={fid[0] || ""}
          disabled={loading}
        />

        2 fid: <input
          type="text"
          onChange={(e)=>handleFidChange(1, e)}
          placeholder="flightPlanIdentifier"
          value={fid[1] || ""}
          disabled={loading}
        />
        <button onClick={() => setFid([])}>clear</button>
        
        {/* Time 설정 */}
        {/* 시작 날짜 및 시간 선택 */}
        <ReactDatePicker
          class="datepicker"
          selected={startDateTime}
          onChange={handleStartDateChange}
          showTimeInput
          timeInputLabel="시작 시간:"
          dateFormat="yyyy년 MM월 dd일 HH:mm:ss"
          placeholderText="시작 날짜 및 시간"
          shouldCloseOnSelect={false}
          locale={ko} //한국어 설정 추가
        />
        ~{/* 종료 날짜 및 시간 선택 */}
        <ReactDatePicker
          class="datepicker"
          selected={endDateTime}
          onChange={handleEndDateChange}
          showTimeInput
          timeInputLabel="종료 시간:"
          dateFormat="yyyy년 MM월 dd일 HH:mm:ss"
          placeholderText="종료 날짜 및 시간"
          minDate={startDateTime} // 시작 시간 이후만 선택 가능하도록 설정
          shouldCloseOnSelect={false}
          locale={ko} //한국어 설정 추가
        />
        {/* 선택된 범위 표시 (선택적) */}
        {startDateTime && endDateTime && (
          <p>
            선택된 범위: {startDateTime.toLocaleString()} ~{" "}
            {endDateTime.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
