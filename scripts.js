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


// Function to fetch and display random words
async function displayRandomWords() {
  try {
    const response = await fetch(`${HEROKU_URL}/random-words`);
    const data = await response.json();
    const randomWordsElement = document.getElementById("randomwords");
    randomWordsElement.textContent = data.words.join(", ");
  } catch (error) {
    console.error("Error fetching random words:", error);
  }
}

// Call the displayRandomWords function to fetch and display random words
displayRandomWords();


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
    const escapedPoem = escapeHtml(poemTextarea.value || "");
    const randomWords = await getRandomWords();
    const poemData = { poemBody: escapedPoem, randomWords };
    const response = await fetch(`${HEROKU_URL}/ai_poem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poemData),
    });
    const { userPoem, aiPoem } = await response.json();
    displayPoems(userPoem, aiPoem);
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

// Function to display both user poem and AI-generated poem
const displayPoems = (userPoem, aiPoem) => {
  const userPoemElement = document.getElementById("user-poem");
  const aiPoemElement = document.getElementById("ai-poem");
  userPoemElement.textContent = `User Poem: ${userPoem}`;
  aiPoemElement.textContent = `AI Poem: ${aiPoem}`;
};

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