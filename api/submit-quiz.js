export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { email, prenom, profil } = req.body;
  const API_KEY = process.env.SYSTEMEIO_API_KEY;

  // APPEL 1 — Créer le contact
  const contactResponse = await fetch("https://api.systeme.io/api/contacts", {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      email,
      firstName: prenom,
      fields: [{ slug: "profil_investisseur", value: profil }],
    }),
  });

  const contactData = await contactResponse.json();
  console.log("Contact créé:", JSON.stringify(contactData));

  // APPEL 2 — Ajouter le tag quiz-immo
  if (contactData.id) {
    const tagResponse = await fetch(
      `https://api.systeme.io/api/contacts/${contactData.id}/tags`,
      {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({ name: "quiz-immo" }),
      }
    );
    const tagData = await tagResponse.json();
    console.log("Tag ajouté:", JSON.stringify(tagData));
  }

  res.status(200).json({ success: true });
}
