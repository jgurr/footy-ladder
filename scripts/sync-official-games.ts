const baseUrl = process.argv[2] || "http://localhost:3000";
const season = Number(process.argv[3] || new Date().getFullYear());
const syncSecret = process.env.SYNC_SECRET;

if (!syncSecret) {
  throw new Error("SYNC_SECRET is required");
}

async function main() {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${syncSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "official-games",
      season,
      allAvailableRounds: true,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Sync failed with HTTP ${response.status}: ${text}`);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
