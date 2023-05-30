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

// Function to generate a poem
const generatePoem = async (prompt, randomWords) => {
  try {
    const aiPrompt = `Compose a poem using the words ${randomWords.join(", ")}:\n\n${prompt}`;
    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        prompt: aiPrompt,
        max_tokens: 100,
        temperature: 0.8
      },
      { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` } }
    );
    return aiResponse.data.choices[0]?.text.trim();
  } catch (error) {
    console.error("Error generating poem:", error);
    return null;
  }
};

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

// Endpoint to get an AI-generated poem
app.get("/ai_poem", async (req, res) => {
  const randomWords = Array.isArray(req.query.randomWords) ? req.query.randomWords : req.query.randomWords.split(",");
  const prompt = "Compose a striking poem that will amaze a reader";
  const generatedPoem = await generatePoem(prompt, randomWords);
  if (generatedPoem) {
    res.json({ poem: generatedPoem });
  } else {
    res.status(500).json({ error: "Unable to generate poem" });
  }
});

app.get("/random-words", (req, res) => {
  const words = randomWords({ exactly: 5 });
  res.json(words);
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

// Endpoint to generate a poem
app.post("/api/generate-poem", (req, res) => {
  const prompt = req.body.prompt;
  const randomWords = req.body.randomWords;
  const poem = generatePoem(prompt, randomWords);
  res.json({ poem: poem });
});