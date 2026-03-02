export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  let body = req.body;

  // Parse le body si ce n'est pas déjà un objet
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const { email, prenom, profil } = body;

  const response = await fetch("https://api.systeme.io/api/contacts", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.SYSTEMEIO_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
   // Remplace la partie tags dans le body par :
body: JSON.stringify({
  email,
  firstName: prenom,
  fields: [{ slug: "profil_investisseur", value: profil }],
  tags: [{ name: "quiz-immo" }],  // ← objet avec name au lieu d'une simple string
}),
  });

  const data = await response.json();
  console.log("Systeme.io response:", JSON.stringify(data));
  res.status(response.ok ? 200 : 500).json(data);
}
