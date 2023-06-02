import express from "express";
import cors from "cors";
import fs from "fs-extra";
import axios from "axios";
import BadWordsFilter from "bad-words";
import randomWords from "random-words";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const filter = new BadWordsFilter();
const poemsDir = "./poems";
fs.ensureDirSync(poemsDir);

// Function to check for inappropriate content
const hasInappropriateContent = (text) => filter.isProfane(text);

// Function to generate random words
function generateRandomWords(numWords) {
  return randomWords({ exactly: numWords, join: " " });
}

// An array of 5 random words generated using the randomWords library.
const words = randomWords({ exactly: 5, join: " " });
console.log(words);

// Function to save a poem
async function savePoem(poemData) {
  const poemFile = `${poemsDir}/poem-${Date.now()}.json`;
  await fs.writeJSON(poemFile, poemData);
}

// Function to generate a poem using the OpenAI API
async function generatePoem(prompt, randomWords, apiKey) {
  const apiUrl = "https://api.openai.com/v1/completions";
  console.log(`Prompt: ${prompt}`);
  console.log(`Random words: ${randomWords}`);
  try {
    const response = await axios.post(apiUrl, {
      prompt: "compose a striking poem that will amaze a reader",
      max_tokens: 100,
      n: 1,
      stop: "\n",
      temperature: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      model: "text-davinci-003",
      prompt_suffix: "\n\n",
      randomWords: randomWords
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const poem = response.data.choices[0].text.trim();
    return poem;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate poem");
  }
}

// Endpoint to generate random words
app.get("/random-words", (req, res) => {
  const numWords = req.query.numWords || 5;
  const randomWords = generateRandomWords(numWords);
  res.send(randomWords);
});


// Endpoint to get an AI-generated poem
app.get("/ai_poem", async (req, res) => {
  const prompt = "Compose a striking poem that will amaze a reader";
  const randomWordsList = randomWords({ exactly: 5, join: " " });
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const poem = await generatePoem(prompt, randomWordsList, apiKey);
    res.json({ poem: poem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate poem" });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});