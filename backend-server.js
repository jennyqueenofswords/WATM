const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const axios = require("axios");
const BadWordsFilter = require("bad-words");
const randomWords = require("random-words");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions";

const app = express();
app.use(cors());
app.use(express.json());

const filter = new BadWordsFilter();
const poemsDir = "./poems";
fs.ensureDirSync(poemsDir);

// Function to check for inappropriate content
const hasInappropriateContent = (text) => filter.isProfane(text);

// Function to generate random words
// An array of 5 random words generated using the randomWords library.
const words = randomWords({ exactly: 5, join: " " });
console.log(words);

// Function to save a poem
async function savePoem(poemData) {
  const poemFile = `${poemsDir}/poem-${Date.now()}.json`;
  await fs.writeJSON(poemFile, poemData);
}



// Endpoint to submit a poem
app.post("/poems", async (req, res) => {
  const poemData = req.body;
  if (hasInappropriateContent(poemData.poem)) {
    res.status(400).send("Inappropriate content detected.");
  } else {
    await savePoem(poemData);
    res.send("Poem submitted");
  }
});

// Function to generate a poem
async function generatePoem(prompt, randomWords) {
  const response = await fetch(process.env.OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7,
      n: 1,
      stop: "\n",
      prompt_suffix: randomWords.join(" "),
    }),
  });
  console.log("OpenAI API response:", response); // log the API response
  const data = await response.json();
  const poem = data.choices[0].text.trim();
  return poem;
}

// Endpoint to generate random words
app.get("/random-words", (req, res) => {
  const numWords = req.query.numWords || 5;
  const randomWords = generateRandomWords(numWords);
  res.send(randomWords);
});

// Endpoint to get an AI-generated poem
app.get("/ai_poem", async (req, res) => {
  const randomWords = Array.isArray(req.query.randomWords) ? req.query.randomWords : req.query.randomWords?.split(",");
  if (!randomWords) {
    res.status(400).json({ error: "Missing randomWords parameter" });
    return;
  }
  const prompt = "Compose a striking poem that will amaze a reader";
  const generatedPoem = await generatePoem(prompt, randomWords);
  console.log("Generated poem:", generatedPoem); // log the generated poem
  if (generatedPoem) {
    res.json({ poem: generatedPoem });
  } else {
    res.status(500).json({ error: "Failed to generate poem" });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Endpoint to get an AI critique
app.post("/ai_critique", async (req, res) => {
  const { poem1, poem2 } = req.body;
  const feedback = await getAiCritique(poem1, poem2);
  if (feedback) {
    res.send({ review: feedback });
  } else {
    res.status(500).send("Unable to generate review");
  }
});

// Function to get an AI critique
async function getAiCritique(poem1, poem2) {
  const prompt = `Read these two poems and provide feedback for each: \n\nPoem 1: ${poem1}\nPoem 2: ${poem2}`;
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error fetching critique:", error);
    return null;
  }
}

// Endpoint to send a vote
app.post("/votes", (req, res) => {
  const voteData = req.body.vote;
  console.log("Received vote for Poem " + voteData);
  // Process the received vote (store in database, update stats, etc.)
  res.json({ message: "Vote processed successfully" });
});

// Default endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the Write Against the Machine API!");
});

console.log(`PORT: ${PORT}`);
console.log(`OPENAI_API_KEY: ${OPENAI_API_KEY}`);
console.log(`OPENAI_API_URL: ${OPENAI_API_URL}`);
