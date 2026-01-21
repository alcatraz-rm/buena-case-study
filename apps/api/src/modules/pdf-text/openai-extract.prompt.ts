export function buildOpenAiEntityExtractionPrompt(inputText: string): string {
  return `You are a strict information extraction engine.

Extract entities from the provided text and return ONLY valid JSON (no markdown, no comments).

Goal: produce a nested structure:
- properties[] (top-level array)
  - buildings[] (nested under each property)
    - units[] (nested under each building)

Return shape (use null when unknown). IMPORTANT: The keys MUST match the database entities exactly.

Enums:
- managementType: "WEG" | "MV" | null
- unitType: "Apartment" | "Office" | "Garden" | "Parking" | null

All "id"/foreign keys:
- If not present in the text, use null (do not invent).
- createdAt/updatedAt/deletedAt should be ISO strings or null (usually null in extraction).

{
  "properties": [
    {
      "name": string | null,
      "managementType": "WEG" | "MV" | null,
      "buildings": [
        {
          "name": string | null,
          "street": string | null,
          "houseNumber": string | null,
          "postalCode": string | null,
          "city": string | null,
          "country": string | null,
          "units": [
            {
              "unitType": "Apartment" | "Office" | "Garden" | "Parking" | null,
              "floor": string | null,
              "number": string | null,
              "description": string | null,
              "entrance": string | null,
              "sizeSqm": number | null,
              "coOwnershipShare": string | null,
              "constructionYear": number | null,
              "rooms": number | null,
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Return JSON only.
- Do not invent facts; if not present, use null.
- If the text clearly contains multiple properties/buildings/units, include them all.
- Discard orphan entities:
  - If you find a building but cannot confidently associate it with a property, DO NOT include that building.
  - If you find a unit but cannot confidently associate it with a building, DO NOT include that unit.
- Use best-effort normalization for numbers (e.g. "52,3 m²" => 52.3).
- Use best-effort splitting of address into street/houseNumber/postalCode/city/country when present.

Text:
${inputText}`;
}
