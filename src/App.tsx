import { useEffect, useState } from "react";
import { getRegionName } from "./api";

type ForecastItem = {
  fcstDate: string; // 예측 날짜 (YYYYMMDD)
  fcstTime: string; // 예측 시간 (HHMM)
  category: "TMP" | "TMX" | "TMN"; // 가능한 카테고리 값만 지정
  fcstValue: string; // 기온 값 (API에서는 string으로 제공될 가능성 높음)
};

function App() {
  const [tmpData, setTmpData] = useState<any[]>([]); // TMP 데이터 상태
  const [tmxTmnData, setTmxTmnData] = useState<any[]>([]); // TMX, TMN 데이터 상태
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
      const tmpData1: ForecastItem[] = data.response.body.items.item;

      // TMP 데이터 필터링
      const tmpData = tmpData1
        .filter((item) => item.category === "TMP")
        .map((item) => ({
          date: item.fcstDate,
          time: item.fcstTime,
          value: item.fcstValue,
        }));

      // TMX, TMN 데이터 필터링
      const tmxTmnData = tmpData1
        .filter((item) => ["TMX", "TMN"].includes(item.category))
        .map((item) => ({
          date: item.fcstDate,
          category: item.category,
          value: item.fcstValue,
        }));

      return { tmpData, tmxTmnData };
    } catch (error) {
      console.error("단기예보 데이터 호출 오류:", error);
      return { tmpData: [], tmxTmnData: [] };
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      const regionData = await getRegionName();
      if (regionData) {
        setRegionName([regionData.city].filter(Boolean).join(" ")); // 지역명 설정
        const { nx, ny } = regionData.gridCoords;

        const { tmpData, tmxTmnData } = await getShortTermData(nx, ny);
        setTmpData(tmpData);
        setTmxTmnData(tmxTmnData);
      }
    };
    fetchWeatherData();
  }, []);

  return (
    <>
      <h1>{regionName}</h1>
      <h2>TMP 데이터</h2>
      <ul>
        {tmpData.map((item, index) => (
          <li key={index}>
            날짜: {item.date}, 시간:{" "}
            {`${item.time.slice(0, 2)}:${item.time.slice(2, 4)}`}, 온도:{" "}
            {item.value}
            °C
          </li>
        ))}
      </ul>
      {/* <pre>{JSON.stringify(tmpData, null, 2)}</pre> */}
      <h2>TMX, TMN 데이터</h2>
      <ul>
        {tmxTmnData.map((item, index) => (
          <li key={index}>
            날짜: {item.date}, 타입:{" "}
            {item.category === "TMN" ? "최저기온" : "최고기온"}, 값:{" "}
            {item.value}°C
          </li>
        ))}
      </ul>
    </>
  );
}
export default App;
