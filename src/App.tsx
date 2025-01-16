function App() {
  const getLatestTmFc = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = now.getHours() < 6 ? "1800" : "0600"; // 6시 이전이면 전날 18시 데이터 요청

    return `${year}${month}${day}${hour}`;
  };

  const getMidFcstData = async (stnId: number) => {
    const API_URL =
      "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst";
    const SERVICE_KEY = import.meta.env.VITE_API_KEY;
    const tmFc = getLatestTmFc(); // 6시 또는 18시 발표 시간 계산

    const params = new URLSearchParams({
      pageNo: "3",
      numOfRows: "100",
      dataType: "JSON",
      stnId: stnId.toString(), // 요청할 지역 코드
      tmFc: tmFc,
    });

    const url = `${API_URL}?serviceKey=${SERVICE_KEY}&${params.toString()}`;
    console.log("🔗 API 요청 URL:", url); // 디버깅용
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(
        `📌 중기예보 (${stnId} 지역) 데이터:`,
        data.response.body.items.item
      );
    } catch (error) {
      console.error("중기예보 데이터 호출 오류:", error);
    }
  };
  getMidFcstData(108);
  return (
    <>
      <h1>Home</h1>
    </>
  );
}
export default App;
