// Base URL for the backend server
const HEROKU_URL = "https://powerful-stream-53189.herokuapp.com/";

// Event listener for button clicks
document.body.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    const buttonId = event.target.id.split('-')[1];
    processVote(buttonId);
  }
});

// Function to fetch data from the server
const fetchData = async (url, requestOptions) => {
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

// Function to submit a poem
const submitPoem = async () => {
  const textarea = document.querySelector("#poem-submission-form textarea");
  const escapedPoem = textarea.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const poemData = { poem: escapedPoem };

  try {
    const response = await fetch(`${HEROKU_URL}/submitPoem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poemData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    animateSubmit();
    showModal("Poem submitted!");
  } catch (error) {
    console.error("Submission error:", error);
    showModal("Failed to submit poem!");
  }
};

// Function to display AI poem
const displayAiPoem = (poem) => {
  const aiPoemSection = document.getElementById("ai-poem");
  const aiGeneratedPoem = document.getElementById("ai-generated-poem");
  const aiCriticReview = document.getElementById("ai-critic-review");

  aiGeneratedPoem.textContent = `AI-generated poem: ${poem.ai_poem}`;
  aiCriticReview.textContent = `AI critic's review: ${poem.ai_review}`;
  aiPoemSection.style.display = "block";
};

// Function to process vote
const processVote = async (vote) => {
  console.log(`Processing vote for Poem ${vote}`);

  try {
    const response = await fetch(`${HEROKU_URL}/send_vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: vote })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error("Error sending vote:", error);
  }
};

// Function to fetch random words
const fetchRandomWords = async () => {
  try {
    const response = await fetch(`${HEROKU_URL}/random_words`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    displayRandomWords(result.randomWords);
  } catch (error) {
    console.error("Error fetching random words:", error);
  }
};

// Call the function in the writing-mode.html page
if (document.getElementById("random-words-container")) {
  fetchRandomWords();
}

// Function to animate submit button
const animateSubmit = () => {
  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.classList.add("animate");
  setTimeout(() => {
    submitBtn.classList.remove("animate");
  }, 1000);
};

// Function to show modal
const showModal = (message) => {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
    <p>${message}</p>
    <button onclick="closeModal(this)">OK</button>
  `;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  setTimeout(() => {
    closeModal(modalContent);
  }, 3000);
};

// Function to close modal
const closeModal = (element) => {
  const modal = element.closest(".modal");
  if (modal) {
    document.body.removeChild(modal);
  }
};
