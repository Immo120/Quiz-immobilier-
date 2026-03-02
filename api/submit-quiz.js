export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { email, prenom, profil } = req.body;
  const API_KEY = process.env.SYSTEMEIO_API_KEY;

  let contactId = null;

  // APPEL 1 — Créer ou récupérer le contact
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

  if (contactData.id) {
    contactId = contactData.id;
  } else {
    const searchResponse = await fetch(
      `https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "X-API-Key": API_KEY, "accept": "application/json" },
      }
    );
    const searchData = await searchResponse.json();
    if (searchData.items && searchData.items.length > 0) {
      contactId = searchData.items[0].id;
    }
  }

  // APPEL 2 — Récupérer l'ID du tag "quiz-immo"
  const tagsResponse = await fetch("https://api.systeme.io/api/tags", {
    method: "GET",
    headers: { "X-API-Key": API_KEY, "accept": "application/json" },
  });
  const tagsData = await tagsResponse.json();
  console.log("Tags disponibles:", JSON.stringify(tagsData));

  const tag = tagsData.items?.find(t => t.name === "quiz-immo");
  const tagId = tag?.id;
  console.log("Tag ID trouvé:", tagId);

  // APPEL 3 — Appliquer le tag au contact
  if (contactId && tagId) {
    const applyTag = await fetch(
      `https://api.systeme.io/api/contacts/${contactId}/tags`,
      {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({ tagId }),
      }
    );
    const applyData = await applyTag.json();
    console.log("Résultat application tag:", JSON.stringify(applyData));
  }

  res.status(200).json({ success: true, contactId, tagId });
}
