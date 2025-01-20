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

  // 중기예보 (3~5일)
  const getMidForeCast = async (stnId: number) => {
    const now = new Date();
    let midData: any[] = [];

    for (let i = 1; i < 4; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");

      const tmFc1 = `${year}${month}${day}0600`; //06시 경 데이터
      const tmFc2 = `${year}${month}${day}1800`; //18시 경 데이터

      const fetchMidData = async (tmFc: string) => {
        const params = new URLSearchParams({
          pageNo: "1",
          numofRows: "100",
          dataType: "JSON",
          stnId: stnId.toString(),
          tmFc: tmFc,
        });

        const url = `${API_URL_MID}?serviceKey=${SERVICE_KEY}&${params.toString()}`;

        try {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          console.log(data);
          return data.response.body.items.item || [];
        } catch (error) {
          console.error("중기예보 데이터 호출 오류:", error);
          return [];
        }
      };
      const data1 = await fetchMidData(tmFc1);
      const data2 = await fetchMidData(tmFc2);
      midData = midData.concat(data1, data2);
    }
    return midData;
  };
  useEffect(() => {
    const fetchWeatherData = async () => {
      const shortTermData = await getShortTermData(55, 157);
      const midTermData = await getMidForeCast(108);

      // 단기 & 중기 데이터 병합
      const resultData = [...shortTermData, ...midTermData];

      console.log("최종 데이터 확인:", resultData);
      setCastData(resultData);
    };
    fetchWeatherData();
  }, []);
  return (
    <>
      <h1>Home</h1>
      <pre>{JSON.stringify(foreCastData, null, 2)}</pre>
    </>
  );
}
export default App;
