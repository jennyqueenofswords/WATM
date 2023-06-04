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
  const { title, poemBody, authorName, authorLink } = poemData;
  const poemId = Date.now();
  const poemFile = `${poemsDir}/poem-${poemId}.json`;
  const poem = {
    id: poemId,
    title,
    poemBody,
    authorName,
    authorLink,
  };
  await fs.writeJSON(poemFile, poem);
  return poem;
}

// Endpoint to generate an AI-generated poem
app.post("/ai_poem", async (req, res) => {
  const { poemBody, randomWords } = req.body;

  try {
    // Save the user poem
    const userPoem = await savePoem(poemBody);

    // Generate the AI-generated poem using the same random words
    const aiPoem = await generatePoem(randomWords, process.env.OPENAI_API_KEY);

    res.json({ userPoem, aiPoem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate poem" });
  }
});

// Function to generate a poem using the OpenAI API
async function generatePoem(generatedWords, apiKey) {
  console.log("Generated Words:", generatedWords);
  const apiUrl = "https://api.openai.com/v1/completions";

  // Generate the prompt
  const prompt = `Compose a striking contemporary poem you might find in the best american poetry 2020. your poem MUST include ALL of the following words: ${generatedWords}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        prompt,
        max_tokens: 100,
        n: 1,
        stop: [".", "?", "!"],
        temperature: 0.5,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        model: "text-davinci-003",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const poem = response.data.choices[0].text.trim();
    return poem;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate poem");
  }
}

// Route handler for the root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the Write Against the Machine API!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
