import { useEffect, useState } from "react";
import { getRegionName } from "./api";
function App() {
  const [foreCastData, setCastData] = useState<any[]>([]);
  const [regionName, setRegionName] = useState<string>(""); // 📌 지역명 상태 추가

  const API_URL_VILAGE =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
  const API_URL_MID =
    "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst";

  const SERVICE_KEY = import.meta.env.VITE_API_KEY;

  // 📌 현재 날짜 기준 발표 시간 설정 (06:00 또는 18:00)
  const getTmFc = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // 만약 현재 시간이 06시 이전이라면, 전날 18:00 발표 데이터 사용
    const hour = now.getHours() < 6 ? "1800" : "0600";

    return `${year}${month}${day}${hour}`;
  };

  // 단기에보 오늘 ~ 3일 후까지
  const getShortTermData = async (nx: number, ny: number) => {
    const now = new Date();
    const baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const baseTime = "0500"; // 05:00 발표 데이터 기준

    const params = new URLSearchParams({
      pageNo: "1",
      numOfRows: "1000",
      dataType: "JSON",
      base_date: baseDate,
      base_time: baseTime,
      nx: nx.toString(), // X 좌표값
      ny: ny.toString(), // Y 좌표값
    });

    const url = `${API_URL_VILAGE}?serviceKey=${SERVICE_KEY}&${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const tmpData1 = data.response.body.items.item;

      // 📌 "TMP" 값만 필터링
      const filteredData = tmpData1
        .filter((item: any) => item.category === "TMP") // TMP만 필터링
        .map((item: any) => ({
          Date: item.fcstDate,
          time: item.fcstTime,
          tmp: item.category, // "TMP"로 고정된 값
          value: item.fcstValue, // 온도 값
        }));

      return filteredData;
    } catch (error) {
      console.error("단기예보 데이터 호출 오류:", error);
      return [];
    }
  };

  // 중기예보 (3~5일)
  const getMidForeCast = async (regId: string) => {
    const tmFc = getTmFc();
    const params = new URLSearchParams({
      pageNo: "1",
      numOfRows: "10",
      dataType: "JSON",
      regId: regId.toString(),
      tmFc: tmFc,
    });

    const url = `${API_URL_MID}?serviceKey=${SERVICE_KEY}&${params.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const items = data.response.body.items.item || [];

      if (items.length === 0) {
        console.log("중기예보 데이터가 없습니다.");
        return [];
      }

      return items.map((item: any) => ({
        date: tmFc,
        region: item.regId,
        day4: { am: item.wf5Am, pm: item.wf5Pm },
        day5: { am: item.wf6Am, pm: item.wf6Pm },
        day6: { am: item.wf7Am, pm: item.wf7Pm },
        day7: item.wf8,
        day8: item.wf9,
        day9: item.wf10,
      }));
    } catch (error) {
      console.error("중기예보 데이터 호출 오류", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      const shortTermData = await getShortTermData(55, 157);
      const midTermData = await getMidForeCast("11B00000");

      const regionData = await getRegionName();
      if (regionData) {
        setRegionName(
          regionData.address.city || regionData.address.town || "알 수 없음"
        ); // 지역명 설정
        const { nx, ny } = regionData.gridCoords;

        const shortTermData = await getShortTermData(nx, ny);
        const midTermData = await getMidForeCast("11B00000");
        setCastData([...shortTermData, ...midTermData]);
      }

      setCastData([...shortTermData, ...midTermData]);
    };
    fetchWeatherData();
  }, []);
  return (
    <>
      <h1>{regionName}</h1>
      <pre>{JSON.stringify(foreCastData, null, 2)}</pre>
    </>
  );
}
export default App;
