const HEROKU_URL = "https://powerful-stream-53189.herokuapp.com";

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

// Get the poem element from the DOM
const poemElement = document.getElementById("ai-generated-poem");


async function getRandomWords() {
  const response = await fetch(`${HEROKU_URL}/random-words`);
  const data = await response.json();
  return data.words;
}

// Function to generate and display a poem
const displayPoem = async () => {
  try {
    // Generate a set of 5 random words
   const randomWords = await fetch(`${HEROKU_URL}/random-words`).then((response) => response.json());
    // Generate a poem using the random words
    const response = await fetch("${HEROKU_URL}/ai_poem?randomWords=" + randomWords.join(","));
    const result = await response.json();
    // Display the generated poem on the page
    poemElement.textContent = result.poem;
  } catch (error) {
    console.error("Error generating poem:", error);
  }
};

// Call the displayPoem function to generate and display a poem
displayPoem();

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
    const poemTextarea = document.querySelector("#poem-text");
    console.log("poemTextarea:", poemTextarea);
    if (!poemTextarea) {
      throw new Error("Poem textarea not found");
    }
    const escapedPoem = escapeHtml(poemTextarea.value || "");
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

const showModal = (message) => {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.textContent = message;
  document.body.appendChild(modal);
  setTimeout(() => {
    modal.remove();
  }, 3000);
};

// Add event listener to poem submission form
const submitButton = document.getElementById("submit-button");
if (submitButton) {
  submitButton.addEventListener("click", handleSubmit);
}

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
window.addEventListener("load", async () => {
  try {
    await getRandomWords();
  } catch (error) {
    console.error("Error getting random words:", error);
  }
});