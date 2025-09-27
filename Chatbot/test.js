async function main() {
text ="Hello, how are you?"
const response = await fetch("http://localhost:5000/api/process-query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: text.trim() }),
  });
  const data = await response.json();
  console.log(data);    }


  main();