export async function POST(req) {
  const body = await req.json();
  const prompt = body.prompt;

  const openai = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es KŌDAMA, une IA experte en configuration de PC gaming, streaming et montage. Réponds en français avec précision, calme et clarté. Tu es la voix d’un sanctuaire digital mystique." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await openai.json();
  const reply = data.choices?.[0]?.message?.content || "Réponse indisponible.";

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
