async function runTest() {
  const app = new App(5, 3, 1);
  const result = await app.run();

  if (!result) {
    console.log("Игра отменена");
    return;
  }

  console.log(result.winnerName);
}

runTest().catch((error) => console.error(error));
