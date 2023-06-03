import express from "express";
import cors from "cors";
import fs from "fs-extra";
import axios from "axios";
import BadWordsFilter from "bad-words";
import randomWords from "random-words";
import dotenv from "dotenv";
dotenv.config();

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

// Function to save a poem
async function savePoem(poemData) {
  const poemFile = `${poemsDir}/poem-${Date.now()}.json`;
  await fs.writeJSON(poemFile, poemData);
}

// Function to generate a poem using the OpenAI API
async function generatePoem(randomWords, apiKey) {
  const apiUrl = "https://api.openai.com/v1/completions";
  
  // Check that there are exactly five words
  if (randomWords.length !== 5) {
    throw new Error("Must provide exactly five random words");
  }
  
  // Generate the prompt
  const prompt = `Compose a striking poem that will amaze a reader. Please use the following words: ${randomWords[0]}, ${randomWords[1]}, ${randomWords[2]}, ${randomWords[3]}, ${randomWords[4]}`;

  try {
    const response = await axios.post(apiUrl, {
      prompt,
      max_tokens: 100,
      n: 1,
      stop: [".", "?", "!"],
      temperature: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      model: "text-davinci-003",
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





// Function to get AI Critique
async function getAiCritique(poem1, poem2, apiKey) {
  console.log("randomWords:", randomWords);
  const apiUrl = "https://api.openai.com/v1/completions";
  try {
    const response = await axios.post(apiUrl, {
      prompt: `Here are two poems. Please provide a critique for each and select a favorite.\n\nPoem 1:\n${poem1}\n\nPoem 2:\n${poem2}`,
      max_tokens: 300,
      n: 1,
      stop: "\n",
      temperature: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      model: "text-davinci-003",
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const feedback = response.data.choices[0].text.trim();
    return feedback;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get critique");
  }
}

// Route handler for the root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the Write Against the Machine API!");
});

// Endpoint to generate random words
app.get("/random-words", (req, res) => {
  const numWords = req.query.numWords || 5;
  const words = generateRandomWords(numWords);
  res.send(words);
});

// Endpoint to get an AI-generated poem
app.get("/ai_poem", async (req, res) => {
  const randomWords = Array.isArray(req.query.randomWords) ? req.query.randomWords : req.query.randomWords?.split(",");
  console.log("randomWords:", randomWords);
  if (!randomWords || randomWords.length === 0) {
    res.status(400).json({ error: "Missing randomWords parameter" });
    return;
  }

  try {
    const poem = await generatePoem(randomWords, process.env.OPENAI_API_KEY);
    res.json({ poem: poem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate poem" });
  }
});


// Endpoint to get an AI critique
app.post("/ai_critique", async (req, res) => {
  const { poem1, poem2 } = req.body;
  const feedback = await getAiCritique(poem1, poem2, process.env.OPENAI_API_KEY);
  if (feedback) {
    res.send({ review: feedback });
  } else {
    res.status(500).send("Unable to generate review");
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
