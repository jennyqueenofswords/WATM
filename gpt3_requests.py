openai.Completion.create(
  engine="gpt-3.5-turbo",
  prompt="Read these two poems and provide feedback for each: \n\nPoem 1: ...\nPoem 2: ...",
  max_tokens=100,
  temperature=0.8
)

{
  "input": "Generate a poem using the following five random words: {word_1}, {word_2}, {word_3}, {word_4}, {word_5}. The poem should be creative and engaging.",
  "output": "{Generated poem}"
}