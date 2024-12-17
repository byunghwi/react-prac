import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import proj4 from 'proj4';

dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  },
  calculateAzimuth(lat1, lon1, lat2, lon2) {
    // 위도와 경도를 라디안으로 변환
    const toRadians = (degree) => degree * (Math.PI / 180);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const deltaLonRad = toRadians(lon2 - lon1);

    // 방위각 계산
    const x = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
    const y =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

    let bearing = Math.atan2(x, y);

    // 라디안을 도(degree)로 변환하고 자북 기준으로 보정
    bearing = (bearing * (180 / Math.PI) + 360) % 360;

    return bearing; // 자북 기준 방위각 (도)
  },
  calculateTime(distanceKm, speedKnots) { // distance는 km로 보내야햠.
    let kmToNauticalMiles = 1.852;
    let distanceNauticalMiles = distanceKm / kmToNauticalMiles;
    let timeInHours = speedKnots > 0 ? distanceNauticalMiles / speedKnots : 0;
    return timeInHours;
  },
  handleKeydownFloat(event) {
    // 숫자와 점만 허용
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
  },
  handleKeydownNumber(event) {
    // 숫자만 허용
    const regex = /^[0-9]*$/;
    if (!regex.test(event.target.value)) {
      // 올바르지 않은 입력 제거
      event.target.value = event.target.value.replace(/[^0-9.]/g, "");
    }
  },
  getRandomColor() { // 랜덤 색상 생성 함수
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `${r}, ${g}, ${b}`;
  },
  convertKm(km) {
    const mile = km * 0.621371; // 1 km = 0.621371 mile
    const ft = km * 3280.84;    // 1 km = 3280.84 ft
    const nm = km * 0.539957;   // 1 km = 0.539957 nm
    const m = km * 1000;
    return {
      M: m.toFixed(2),  // 소수점 2자리까지 반올림
      FT: ft.toFixed(2),
      NM: nm.toFixed(2),
      KM: km.toFixed(2)
    };
  },
  convertToFeet(value, unit) {
    switch (unit) {
      case 'M':
        return value * 3.28084; // 미터를 피트로 변환
      case 'KM':
        return value * 3280.84; // 킬로미터를 피트로 변환
      case 'FT':
        return value; // 이미 피트이므로 그대로 반환
    }
  },
  getFormattedDateTime() {
    let day = dayjs();
    let formattedUTC = day.utc().format('HH:mm:ss');
    let formattedKST = day.utcOffset(9).format('HH:mm:ss');
    let shortKST = day.utcOffset(9).format('HH:mm');
    return {
      utc: formattedUTC,
      kst: formattedKST,
      s_k: shortKST
    };
  },
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  formatDate2(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  },
  getTimeComponents(utcString){
    const date = new Date(utcString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  formatUTCDate(utcDate) {
    const date = new Date(utcDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day},${hours}:${minutes}`;
  },
  addSecondsToUTC(nowUTC, secondsToAdd) {
    nowUTC = new Date(nowUTC);
    nowUTC.setUTCSeconds(nowUTC.getUTCSeconds() + secondsToAdd);
    return nowUTC.toISOString();
  },
  formatApprovalDate(utcString) {
    const date = new Date(utcString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day} ${hours}${minutes}${seconds}`;
  },
  formatApprovalDate2(utcString) {
    const date = new Date(utcString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  },
  addTimeToUTC(utcString, hoursToAdd = 0, minutesToAdd = 0, secondsToAdd = 0) {
    const date = new Date(utcString);
    date.setUTCHours(date.getUTCHours() + hoursToAdd);
    date.setUTCMinutes(date.getUTCMinutes() + minutesToAdd);
    date.setUTCSeconds(date.getUTCSeconds() + secondsToAdd);
    return date.toISOString(); // 'YYYY-MM-DDTHH:MM:SSZ' 형식으로 반환
  },
  // 좌표계 변환 sourceEPSG -> targetEPSG
  transformCoordinates (coords, sourceEPSG, targetEPSG) {
    const [x, y] = proj4(sourceEPSG, targetEPSG, coords);
    return { x, y };
  },
  getSecondsDifference(date1, date2) {
    const diffInMilliseconds = dayjs(date1).diff(dayjs(date2));
    const diffInSeconds = Math.abs(diffInMilliseconds / 1000); // 밀리초를 초로 변환
    return diffInSeconds;
  },
  sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms));},
  async wrapSlept(second, call){
    // console.log("[wait]", second, call);
    await this.sleep(second) ;
  },
  calculateDistance(speedInKnots, timeInMinutes) {
    const speedInKmPerHour = speedInKnots * 1.852; // 노트를 km/h로 변환
    const timeInHours = timeInMinutes / 60; // 분을 시간으로 변환
    const distance = speedInKmPerHour * timeInHours; // 거리 계산
    return distance;
  },
  vectorPoint(lat1, lon1, lat2, lon2, degrees){
    // 도(degrees)를 라디안(radians)으로 변환
    const radians = degrees * (Math.PI / 180);

    // 위도와 경도를 라디안으로 변환
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const lon2Rad = lon2 * (Math.PI / 180);

    // 두 점 사이의 거리 계산 (Haversine formula)
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const earthRadiusKm = 6371;
    const distance = earthRadiusKm * c;

    // 새로운 좌표 계산
    const newLat = lat1 + (distance * Math.cos(radians) / earthRadiusKm) * (180 / Math.PI);
    const newLon = lon1 + (distance * Math.sin(radians) / (earthRadiusKm * Math.cos(lat1Rad))) * (180 / Math.PI);

    return [newLon, newLat]
  },
  calculateScale(zoom) {
    let scale = 0;
    if (zoom <= 10) {
      // 줌 레벨 5에서 0.1, 줌 레벨 10에서 0.5로 선형 보간
      scale = 0.1 + (0.5 - 0.1) * ((zoom - 5) / (10 - 5));
    } else {
      // 줌 레벨 10에서 0.5, 줌 레벨 18에서 2로 선형 보간
      scale = 0.5 + (2 - 0.5) * ((zoom - 10) / (18 - 10));
    }
    return scale;
  },
  calculateScaleText(zoom) {
    let scale = 0;
    if (zoom <= 10) {
      // 줌 레벨 5에서 0.1, 줌 레벨 10에서 0.5로 선형 보간
      scale = 0.5 + (1 - 0.5) * ((zoom - 5) / (10 - 5));
    } else {
      // 줌 레벨 10에서 0.5, 줌 레벨 18에서 2로 선형 보간
      scale = 1 + (2 - 1) * ((zoom - 10) / (18 - 10));
    }
    return scale;

  },
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0; // 0~15 사이의 랜덤 숫자
      const v = c === 'x' ? r : (r & 0x3) | 0x8; // x는 랜덤 값, y는 8-11 범위 값
      return v.toString(16); // 16진수로 변환
    });
  }
}