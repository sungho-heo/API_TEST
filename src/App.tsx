function App() {
  const callJsonApi = (url: string) => {
    // Text API 호출 함수
    fetch(url) // fetch를 통해 API 호출
      .then((response) => response.json()) // 응답을 JSON으로 변환
      .then((data) => {
        console.log(data); // 데이터 출력
        // saveFilePath를 사용하여 데이터를 저장하거나 추가적인 처리를 수행할 수 있습니다.
      })
      .catch((error) => {
        console.error("API 호출 중 오류가 발생했습니다:", error);
        // 오류 처리를 수행할 수 있습니다.
      });
  };
  // 사용 예시
  const apiUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst?serviceKey=${
    import.meta.env.VITE_API_KEY
  }&pageNo=1&numOfRows=10&dataType=JSON&stnId=108&tmFc=202501080600
`;
  callJsonApi(apiUrl);
  return (
    <>
      <h1>Home</h1>
    </>
  );
}
export default App;
