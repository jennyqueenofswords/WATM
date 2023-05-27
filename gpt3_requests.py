# GPT-3.5 API call for AI critique feedback
openai.Completion.create(
  engine="gpt-3.5-turbo",
  prompt="Read these two poems and provide feedback for each: \n\nPoem 1: ...\nPoem 2: ...",
  max_tokens=100,
  temperature=0.5
)