import { useEffect, useState } from "react";
function App() {
  const [foreCastData, setCastData] = useState<any[]>([]);

  const API_URL_VILAGE =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
  const API_URL_MID =
    "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst";

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
      numOfRows: "10",
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
      return data.response.body.items.item || [];
    } catch (error) {
      console.error("단기예보 데이터 호출 오류:", error);
      return [];
    }
  };
  const getLatestTmFc = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = now.getHours() < 6 ? "1800" : "0600"; // 6시 이전이면 전날 18시 데이터 요청

    return `${year}${month}${day}${hour}`;
  };
  console.log(getShortTermData(55, 127));
  return (
    <>
      <h1>Home</h1>
    </>
  );
}
export default App;
