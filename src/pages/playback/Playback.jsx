import { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import BaseMap from "../../components/BaseMap";
import "../../styles/playback.css";
import usePlaybackStore from "../../stores/playback";

export default function Playback() {
  //store
  const { playback_id, isWSMsgRequired, originQueue, actions: { connection, stopPlayBack }} = usePlaybackStore();

  //내부
  const [playState, setPlayState] = useState("stop");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("flow");
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [fid, setFid] = useState("7b1ea497-620e-4a56-b544-3656ef6a5535");
  const [startDateTime, setStartDateTime] = useState('2024-12-19 14:31:00');
  const [endDateTime, setEndDateTime] = useState('2024-12-20 14:00:00');
  const [beforeUnloadHandler, setBeforeUnloadHandler] = useState(null);

  const handlePlay = (type) => {};

  const handleModeChange = (e) => {
    setReplaySpeed(e.target.value);
  };

  const handleFidChange = () => {

  };

  const handleStartDateChange = (date) => {
    setStartDateTime(date);
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(date);
  };

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

    connection();

    return () => {
      console.log('언마운트 될때 실행...?');
    }
  }, [])

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
        <select onChange={handleModeChange}>
          <option value="1">x1</option>
          <option value="2">x2</option>
          <option value="4">x4</option>
        </select>
        {/* flightPlanIdentifier 입력 */}
        <input
          type="text"
          onChange={handleFidChange}
          placeholder="flightPlanIdentifier"
          value={fid}
          disabled={loading}
        />
        <button onClick={() => setFid("")}>clear</button>
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
