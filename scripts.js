// Base URL for the backend server
const HEROKU_URL = "https://powerful-stream-53189.herokuapp.com/";

// Event listener for button clicks
document.body.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    const buttonId = event.target.id.split('-')[1];
    if (buttonId === 'submit-poem') {
      submitPoem();
    } else if (buttonId === 'vote-human' || buttonId === 'vote-ai') {
      processVote(buttonId);
    }
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

    const result = await response.json();
    animateSubmit();
    showModal("Poem submitted!");

    // Display user's poem and AI-generated poem with critic review
    const aiPoemSection = document.getElementById("ai-poem");
    const aiGeneratedPoem = document.getElementById("ai-generated-poem");
    const aiCriticReview = document.getElementById("ai-critic-review");
    aiGeneratedPoem.textContent = `AI-generated poem: ${result.ai_poem}`;
    aiCriticReview.textContent = `AI critic's review: ${result.ai_review}`;
    aiPoemSection.style.display = "block";
    
    // Save user's poem to database
    const nameInput = document.querySelector("#poem-submission-form input[name='name']");
    const linkInput = document.querySelector("#poem-submission-form input[name='link']");
    const name = nameInput.value;
    const link = linkInput.value;
    const randomWords = result.random_words;
    const userPoem = { poem: escapedPoem, name: name, link: link, randomWords: randomWords };
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
  } catch (error) {
    console.error("Submission error:", error);
    showModal("Failed to submit poem!");
  }
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
  const humanVoteBtn = document.getElementById("vote-human");
  const aiVoteBtn = document.getElementById("vote-ai");

  humanPoemText.textContent = humanPoem.poem;
  humanPoemAuthor.textContent = `By ${humanPoem.name}`;
  aiPoemText.textContent = aiPoem.poem;
  aiPoemAuthor.textContent = `By AI`;
  humanPoemSection.style.display = "block";
  aiPoemSection.style.display = "block";
  humanVoteBtn.dataset.poemId = humanPoem._id;
  aiVoteBtn.dataset.poemId = aiPoem._id;
};

// Function to process vote
const processVote = async (vote) => {
  console.log(`Processing vote for Poem ${vote}`);

  try {
    const poemId = event.target.dataset.poemId;
    const response = await fetch(`${HEROKU_URL}/send_vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: vote, poemId: poemId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result.message);

    // Display authorship and critic's choice
    const humanPoemAuthor = document.getElementById("human-poem-author");
    const aiPoemAuthor = document.getElementById("ai-poem-author");
    const criticChoice = document.getElementById("critic-choice");
    humanPoemAuthor.textContent = `By ${result.human_poem.name}`;
    aiPoemAuthor.textContent = `By AI`;
    criticChoice.textContent = `Critic's choice: ${result.critic_choice}`;
  } catch (error) {
    console.error("Error sending vote:", error);
  }
};

// Function to display random words
const displayRandomWords = (words) => {
  const randomWordsContainer = document.querySelector(".random-words-container");
  randomWordsContainer.textContent = words;
};

// Function to fetch random words
const fetchRandomWords = async () => {
  try {
    const response = await fetch(`${HEROKU_URL}/random_words`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    displayRandomWords(result);
  } catch (error) {
    console.error("Error fetching random words:", error);
  }
};

// Fetch random words on page load
window.addEventListener("load", () => {
  fetchRandomWords();
});

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

// Call the function in the writing-mode.html page
if (document.getElementById("random-words-container")) {
  fetchRandomWords();
}

// Call the function in the voting-mode.html page
if (document.getElementById("voting-container")) {
  const fetchPoems = async () => {
    try {
      const response = await fetch(`${HEROKU_URL}/getPoems`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      displayVotingPoems(result.poems);
    } catch (error) {
      console.error("Error fetching poems:", error);
    }
  };
  fetchPoems();
}