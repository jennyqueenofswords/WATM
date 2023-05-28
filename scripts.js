document.getElementById("vote-1").addEventListener("click", () => {
  processVote(1);
});

document.getElementById("vote-2").addEventListener("click", () => {
  processVote(2);
});

function getAiPoem() {
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

getRandomWords();

function submitPoem() {
  console.log("Poem submitted");
}

function animateSubmit() {
  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.classList.add("animate");

  setTimeout(() => {
    submitBtn.classList.remove("animate");
  }, 1000);
}

function fetchPoemsForVoting() {
  const apiUrl = "http://localhost:3000/fetch_poems";

  $.get(apiUrl)
    .done((data) => {
      $("#poem-1 p").text(data.poem_1.text);
      $("#poem-2 p").text(data.poem_2.text);
    })
    .fail((error) => {
      console.error("Error fetching poems for voting:", error);
    });
}

function processVote(vote) {
  const apiUrl = "http://localhost:3000/vote";

  $.post(apiUrl, { vote: vote })
    .done((data) => {
      $("#winning-poem-result").text("The winning poem is: " + data.winning_poem.text);
      $("#authorship-result").text("Authorship: " + (data.winning_poem.isAI ? "AI" : "Human"));
      $("#ai-critic-choice").text("AI critic's choice: " + (data.ai_critic_choice === 1 ? "Poem 1" : "Poem 2"));
      $("#voting-stats").text("Voting statistics: " + JSON.stringify(data.voting_statistics));

      $("#results").show();
      $("#poems").hide();
    })
    .fail((error) => {
      console.error("Error processing vote:", error);
    });
}

fetchPoemsForVoting();
function displayAiPoem(poem) {
  const aiPoemSection = document.getElementById("ai-poem");
  const aiGeneratedPoem = document.getElementById("ai-generated-poem");
  const aiCriticReview = document.getElementById("ai-critic-review");

  aiGeneratedPoem.textContent = "AI-generated poem: " + poem.ai_poem;
  aiCriticReview.textContent = "AI critic's review: " + poem.ai_review;

  aiPoemSection.style.display = "block";
}

function submitPoem() {
  console.log("Poem submitted");

  // Fetch the AI-generated poem and AI critic's review using getAiPoem()
  getAiPoem();
}
function displayAiPoem(poem) {
  const aiPoemSection = document.getElementById("ai-poem");
  const aiGeneratedPoem = document.getElementById("ai-generated-poem");
  const aiCriticReview = document.getElementById("ai-critic-review");

  aiGeneratedPoem.textContent = "AI-generated poem: " + poem.ai_poem;
  aiCriticReview.textContent = "AI critic's review: " + poem.ai_review;

  aiPoemSection.style.display = "block";
}

function submitPoem() {
  console.log("Poem submitted");

  // Fetch the AI-generated poem and AI critic's review using getAiPoem()
  getAiPoem();
}
async function getAiCritique(poem1, poem2) {
  const apiUrl = "http://localhost:3000/ai_critique";
  const data = await fetchData(apiUrl, { poem1, poem2 });

  if (data && data.review) {
    return data.review;
  } else {
    return null;
  }
}