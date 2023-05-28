const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const axios = require("axios");
const BadWordsFilter = require("bad-words");

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = "YOUR_API_KEY";
const OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";

const app = express();
app.use(cors());
app.use(express.json());

const filter = new BadWordsFilter();

const poemsDir = "./poems";
fs.ensureDirSync(poemsDir);

function hasInappropriateContent(text) {
  return filter.isProfane(text);
}

function generateRandomWords(num_words) {
  const allWords = [
    "sun", "moon", "stars", "clouds", "rain", "snow", "wind", "storm",
  ];

  const randomWords = [];
  for (let i = 0; i < num_words; i++) {
    const randomIndex = Math.floor(Math.random() * allWords.length);
    randomWords.push(allWords[randomIndex]);
  }

  return randomWords;
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
        max_tokens: 200,
        temperature: 0.7
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
  const randomWords = req.query.randomWords.split(",");
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

async function getAiCritique(poem1, poem2) {
  const apiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions";
  const prompt = `Read these two poems and provide feedback for each: \n\nPoem 1: ${poem1}\nPoem 2: ${poem2}`;
  
  try {
    const response = await axios.post(
      apiUrl,
      {
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error fetching critique:", error);
    return null;
  }
}

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