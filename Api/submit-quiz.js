export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { email, prenom, profil } = req.body;

  const response = await fetch("https://api.systeme.io/api/contacts", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.SYSTEMEIO_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      email,
      firstName: prenom,
      fields: [{ slug: "profil_investisseur", value: profil }],
      tags: ["quiz-immo"],
    }),
  });

  const data = await response.json();
  res.status(response.ok ? 200 : 500).json(data);
}
