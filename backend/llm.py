import os
from groq import Groq

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set. Please set it before running the server.")
    return Groq(api_key=api_key)

def generate_text(prompt: str, model: str = "llama-3.3-70b-versatile") -> str:
    client = get_groq_client()
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert AI research assistant who writes academic papers in strict IEEE style. Your output must be plain text without markdown formatting or LaTeX. Do not include any introductory or concluding conversational text.",
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=model,
        temperature=0.7,
        max_tokens=2048,
    )
    return chat_completion.choices[0].message.content.strip()
