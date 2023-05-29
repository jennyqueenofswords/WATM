const HEROKU_URL = "https://your-heroku-app.herokuapp.com";

// Function to escape HTML characters
const escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Function to generate a poem
const generatePoem = async (poem) => {
  const response = await fetch(`${HEROKU_URL}/generatePoem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ poem }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result;
};

// Function to get random words from server
const getRandomWords = async () => {
  const response = await fetch(`${HEROKU_URL}/random-words`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.words;
};

// Function to save user's poem to database
const savePoem = async (poem, name, link, randomWords) => {
  const userPoem = { poem, name, link, randomWords };
  const saveResponse = await fetch(`${HEROKU_URL}/savePoem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userPoem),
  });
  if (!saveResponse.ok) {
    throw new Error(`HTTP error! status: ${saveResponse.status}`);
  }
};

// Function to handle poem submission
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    const poemTextarea = document.querySelector("#poem-submission-form textarea");
    const escapedPoem = escapeHtml(poemTextarea.value);
    const result = await generatePoem(escapedPoem);
    const aiGeneratedPoem = document.getElementById("ai-generated-poem");
    const aiCriticReview = document.getElementById("ai-critic-review");
    aiGeneratedPoem.textContent = `AI-generated poem: ${result.ai_poem}`;
    aiCriticReview.textContent = `AI critic's review: ${result.ai_review}`;
    const randomWords = await getRandomWords();
    await savePoem(escapedPoem, result.author, result.link, randomWords);
    animateSubmit();
    showModal("Poem submitted!");
  } catch (error) {
    console.error("Submission error:", error);
    showModal("Failed to submit poem!");
  }
};

// Add event listener to poem submission form
const poemForm = document.getElementById("poem-submission-form");
poemForm.addEventListener("submit", handleSubmit);

// Function to display poems for voting
const displayVotingPoems = (poems) => {
  const humanPoem = poems[0];
  const aiPoem = poems[1];
  const humanPoemSection = document.getElementById("human-poem");
  const aiPoemSection = document.getElementById("ai-poem");
  const humanPoemText = document.getElementById("human-poem-text");
  const aiPoemText = document.getElementById("ai-poem-text");
  const humanPoemAuthor = document.getElementById("human-poem-author");
  const aiPoemAuthor = document.getElementById("ai-poem-author");
  humanPoemText.textContent = humanPoem.poem;
  humanPoemAuthor.textContent = `Human author: ${humanPoem.name}`;
  aiPoemText.textContent = aiPoem.poem;
  aiPoemAuthor.textContent = `AI author: ${aiPoem.author}`;
  humanPoemSection.style.display = "block";
  aiPoemSection.style.display = "block";
};