import axios from "axios";

// 기상청 위성값 => 격자 좌표 데이터로 변환
const TO_GRID = (lat: number, lon: number) => {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1
  const SLAT2 = 60.0; // 투영 위도2
  const OLON = 126.0; // 기준점 경도
  const OLAT = 38.0; // 기준점 위도
  const XO = 43; // 기준점 X 좌표
  const YO = 136; // 기준점 Y 좌표

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf =
    (Math.tan(Math.PI * 0.25 + slat1 * 0.5) ** sn * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / ro ** sn;

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / ra ** sn;
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
};

// 브라우저의 Geolocation API를 통해서 사용자의 위치정보 데이터를 얻어옴.
const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject(new Error("사용자의 위치정보 값을 받아오지 못했습니다."));
    }
  });
};

export const getRegionName = async () => {
  try {
    const position = await getUserLocation();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const address = response.data.address;
    console.log("사용자 지역 정보:", address);

    // 위경도 → 기상청 격자 좌표 변환
    const gridCoords = TO_GRID(lat, lon);
    console.log("변환된 격자 좌표:", gridCoords);

    return { address, gridCoords };
  } catch (error) {
    console.error("위치 정보 가져오기 실패:", error);
    return null;
  }
};
