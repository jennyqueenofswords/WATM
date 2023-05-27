function getAiPoem() {
  // Replace this path with the URL serving your backend
  const apiUrl = "http://localhost:3000/ai_poem";

  $.get(apiUrl)
    .done((data) => {
      displayAiPoem(data.poem);
    })
    .fail((error) => {
      console.error("Error fetching AI-generated poem:", error);
    });
}
function getRandomWords() {
  // Replace this path with the URL serving your backend
  const apiUrl = "http://localhost:3000/random_words";

  $.get(apiUrl)
    .done((data) => {
      const randomWordsContainer = $("#random-words-container");
      for (const word of data.randomWords) {
        randomWordsContainer.append(`<span>${word}</span> `);
      }
    })
    .fail((error) => {
      console.error("Error fetching random words:", error);
    });
}

// Call this function when the Writing Mode page is loaded
getRandomWords();