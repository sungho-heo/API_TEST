import axios from "axios";

// 기상청 격자 좌표 데이터
const GRID_COORDS: Record<string, { nx: number; ny: number }> = {
  서울특별시: { nx: 60, ny: 127 },
  부산광역시: { nx: 98, ny: 76 },
  대구광역시: { nx: 89, ny: 90 },
  인천광역시: { nx: 55, ny: 124 },
  광주광역시: { nx: 58, ny: 74 },
  대전광역시: { nx: 67, ny: 100 },
  울산광역시: { nx: 102, ny: 84 },
};

// 지역명을 기반으로 격자 좌표 찾기
const getGridCoords = (regionName: string) => {
  return GRID_COORDS[regionName] || { nx: 60, ny: 127 }; // 기본값: 서울
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

export const getRegionName = async (lat: number, lon: number) => {
  try {
    const position = await getUserLocation();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    console.log(response.data.address);
    return response.data.address;
  } catch (error) {
    console.error("위치 정보 가져오기 실패:", error);
    return null;
  }
};
