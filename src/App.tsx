function App() {
  const getLatestTmFc = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = now.getHours() < 6 ? "1800" : "0600"; // 6시 이전이면 전날 18시 데이터 요청

    return `${year}${month}${day}${hour}`;
  };
  return (
    <>
      <h1>Home</h1>
    </>
  );
}
export default App;
