const axios = require("axios");

const OPENAI_API_KEY = "YOUR_API_KEY"; // REPLACE WITH YOUR API KEY
const OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci-codex/completions"; // GPT-3.5-turbo endpoint

const openaiHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENAI_API_KEY}`
};

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
      { headers: openaiHeaders }
    );

    return aiResponse.data.choices[0]?.text.trim();
  } catch (error) {
    console.error("Error generating poem:", error);
    return null;
  }
}

app.get("/ai_poem", async (req, res) => {
  // Use the same random words for both the human writer and the AI writer
  const randomWords = req.query.randomWords.split(",");
  const prompt = "Compose a striking poem that will amaze a reader";
  const generatedPoem = await generatePoem(prompt, randomWords);

  if (generatedPoem) {
    res.json({ poem: generatedPoem });
  } else {
    res.status(500).json({ error: "Unable to generate poem" });
  }
});
// Express route for poem submission
app.post('/submitPoem', (req, res) => {
  const poemData = req.body;
  // Add moderation system and poem storage logic here
  res.send('Poem submitted');
});

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Fetch leaderboard data
async function getLeaderboardData() {
  // Replace with actual leaderboard data fetching implementation
  return [
    { name: "Alice", winRate: 0.85 },
    { name: "Bob", winRate: 0.83 },
    { name: "Charlie", winRate: 0.81 },
  ];
}

app.get('/leaderboard', async (req, res) => {
  const leaderboardData = await getLeaderboardData();
  res.json(leaderboardData);
});

// Add this function to update the leaderboard upon a poem's submission
function updateLeaderboard(writerName, winRate, authenticated = false) {
  // Add logic to determine how writerName should be displayed in the leaderboard
  const nameDisplay = authenticated ? writerName : 'Anonymous';
  leaderboardData.push({ name: nameDisplay, winRate, isAI: false });

  // Sort leaderboardData by winRate in descending order
  leaderboardData.sort((a, b) => b.winRate - a.winRate);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const BadWordsFilter = require('bad-words');
const filter = new BadWordsFilter();

// ...

// Add this function to check if the content contains inappropriate words
function hasInappropriateContent(text) {
  return filter.isProfane(text);
}

// Use this function to moderate submitted poems before processing them
app.post('/submitPoem', (req, res) => {
  const poemData = req.body;
  if (hasInappropriateContent(poemData.poem)) {
    res.status(400).send('Inappropriate content detected.');
  } else {
    // Add approved poem storage logic here
    res.send('Poem submitted');
  }
});
const fs = require('fs-extra');

// Use these lines to create a folder for storing poems
const poemsDir = './poems';
fs.ensureDirSync(poemsDir);

// ...

// Add this function to save the poem as a JSON file
async function savePoem(poemData) {
  const poemFile = `${poemsDir}/poem-${Date.now()}.json`;
  await fs.writeJSON(poemFile, poemData);
}

// Modify the '/submitPoem' route to save the poem using savePoem function
app.post('/submitPoem', async (req, res) => {
  const poemData = req.body;
  if (hasInappropriateContent(poemData.poem)) {
    res.status(400).send('Inappropriate content detected.');
  } else {
    await savePoem(poemData);
    if (poemData.authenticated) {
      updateLeaderboard(poemData.writerName, poemData.winRate, true);
    } else {
      updateLeaderboard(null, poemData.winRate, false);
    }
    res.send('Poem submitted');
  }
});