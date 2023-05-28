const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const axios = require("axios");
const BadWordsFilter = require("bad-words");

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

function hasInappropriateContent(text) {
  return filter.isProfane(text);
}

const randomWords = require('random-words');

function generateRandomWords(num_words) {
  return randomWords({ exactly: num_words });
}

async function savePoem(poemData) {
  const poemFile = `${poemsDir}/poem-${Date.now()}.json`;
  await fs.writeJSON(poemFile, poemData);
}

async function generatePoem(prompt, randomWords) {
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
}

app.post("/submitPoem", async (req, res) => {
  const poemData = req.body;
  if (hasInappropriateContent(poemData.poem)) {
    res.status(400).send("Inappropriate content detected.");
  } else {
    await savePoem(poemData);
    res.send("Poem submitted");
  }
});

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

app.get("/random_words", (req, res) => {
  res.json({ randomWords: generateRandomWords(5) });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const openaiApiKey = "YOUR_OPENAI_API_KEY";

app.post("/ai_critique", async (req, res) => {
  const poem1 = req.body.poem1;
  const poem2 = req.body.poem2;
  const feedback = await getAiCritique(poem1, poem2);

  if (feedback) {
    res.send({ review: feedback });
  } else {
    res.status(500).send("Unable to generate review");
  }
});

/* Add the GPT-3 Requests for AI critique */
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
app.get("/random_words", (req, res) => {
  res.json({ randomWords: generateRandomWords(5) });
});
app.post("/send_vote", (req, res) => {
  const voteData = req.body.vote;
  console.log("Received vote for Poem " + voteData);
  // Process the received vote (store in database, update stats, etc.)
  res.json({ message: "Vote processed successfully" });
});
app.get("/", (req, res) => {
  res.send("Welcome to the Write Against the Machine API!");
});