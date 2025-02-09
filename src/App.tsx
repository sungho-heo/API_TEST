import { useEffect, useState } from "react";
import { getRegionName } from "./api";
function App() {
  const [foreCastData, setCastData] = useState<any[]>([]);
  const [regionName, setRegionName] = useState<string>(""); // 📌 지역명 상태 추가

  const API_URL_VILAGE =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

  const SERVICE_KEY = import.meta.env.VITE_API_KEY;

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

  useEffect(() => {
    const fetchWeatherData = async () => {
      const regionData = await getRegionName();
      if (regionData) {
        setRegionName([regionData.city].filter(Boolean).join(" ")); // 지역명 설정
        const { nx, ny } = regionData.gridCoords;

        const shortTermData = await getShortTermData(nx, ny);
        setCastData([...shortTermData]);
      }
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
