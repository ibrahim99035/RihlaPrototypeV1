import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK with client User-Agent header and soft check for key
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY || "";

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Successfully initialized Gemini GenAI SDK.");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
  }
} else {
  console.log("No custom GEMINI_API_KEY supplied, using rich fallback simulator.");
}

// 1. API: Weather & Current Conditions
app.get("/api/conditions", (req, res) => {
  const location = req.query.location as string || "Luxor";
  if (location.toLowerCase() === "giza") {
    res.json({
      location: "Giza",
      temp: "34°C",
      humidity: "42%",
      uvIndex: 8,
      uvLevel: "VERY HIGH",
      uvTip: "Wear linen clothing, wear sunglasses.",
      aqi: 48,
      aqiStatus: "Good",
      heatStatus: "MODERATE",
    });
  } else if (location.toLowerCase() === "aswan") {
    res.json({
      location: "Aswan",
      temp: "41°C",
      humidity: "18%",
      uvIndex: 11,
      uvLevel: "EXTREME",
      uvTip: "Avoid sun from 11AM-4PM, hydrate constant.",
      aqi: 22,
      aqiStatus: "Excellent",
      heatStatus: "SCORCHING",
    });
  } else {
    // defaults to Luxor
    res.json({
      location: "Luxor",
      temp: "38°C",
      humidity: "21%",
      uvIndex: 9,
      uvLevel: "VERY HIGH",
      uvTip: "Apply sunscreen, seek shade 12-3pm.",
      aqi: 54,
      aqiStatus: "Moderate",
      heatStatus: "EXTREME",
    });
  }
});

// 2. API: Ask Ra AI Chat
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, siteContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages structure." });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";
  const systemPrompt = `You are Ra, the ancient Egyptian Sun God, acting as an elite personal luxury travel companion on a traveler's "Rihla" (or journey) through Egypt.
You speak with absolute historical authority, poetic grace, and high-end cultural elegance.
Refer to the traveler as "traveler", "seeker", or "noble friend". Incorporate concepts of light, sun, the Nile, and local customs.
Keep responses concise, beautiful, beautifully structured with HTML inline tags (like <b class="text-secondary">keyword</b>, or <i>italics</i> for emphasis), and highlight 1-2 interesting secrets, myths, or tips.
If asked about a specific site context, e.g. ${siteContext || "Luxor Temple / Giza"}, focus on that.`;

  if (ai) {
    try {
      // Create chats or use generateContent
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: latestMessage || "Greetings, Ra!",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I am reflecting on the sands of time, noble traveler.";
      return res.json({ text: responseText });
    } catch (err: any) {
      console.error("Gemini API error during chat:", err);
      // Fallback gracefully
    }
  }

  // Simulated AI response fallback
  let fallbackReply = "By the warmth of the sun, that is a profound inquiry! ";
  if (latestMessage.toLowerCase().includes("north") || latestMessage.toLowerCase().includes("pyramid")) {
    fallbackReply += `The ancient pharaohs aligned their monumental structure with <span class="text-secondary font-bold">Thuban</span>, the North Star of that era. They believed this channel created a celestial gateway for the pharaoh's soul to join the <i>Imperishable Stars</i> in the northern skies, never to fade.`;
  } else if (latestMessage.toLowerCase().includes("price") || latestMessage.toLowerCase().includes("ticket")) {
    fallbackReply += `The standard entry to the royal grounds of Karnak is <span class="text-secondary font-bold">EGP 360</span>, while the Luxor Temple commands <span class="text-secondary font-bold">EGP 300</span>. Ensure you secure your passes at dawn to bypass the mid-day lines under the relentless crown of Ra.`;
  } else {
    fallbackReply += `The divine sands of <b>${siteContext || "Ancient Thebes"}</b> harbor secrets spanning five millennia. As your Guide of Light, I suggest you observe the sunrise or sunset near the temples—a sublime moment when the limestone glows gold and whispers to the heavens. What else does your soul seek on this Rihla?`;
  }

  setTimeout(() => {
    res.json({ text: fallbackReply });
  }, 900);
});

// 3. API: Identify Monument Vision/Preset API
app.post("/api/gemini/identify", async (req, res) => {
  const { landmarkName, imagePreset, customPrompt } = req.body;

  const systemInstruction = `You are Ra, the luxury travel companion. Identify the given monument: '${landmarkName || "Egyptian structure"}'.
Return key details: Name of Monument, Location, built by/era, and a fascinating historical secret (called "Ra's Guide").
Be extremely informative, cinematic, and use rich, readable visual labels. If there is a custom prompt, answer it directly with high-fidelity Egyptology details.`;

  if (ai && landmarkName) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Provide deep dive info, timeline context, and premium tour tip for: ${landmarkName}. ${customPrompt || ""}`,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });
      return res.json({ text: response.text });
    } catch (err) {
      console.error("Gemini monument identification error:", err);
    }
  }

  // Default rich fallbacks based on presets
  const presetData: Record<string, any> = {
    "Luxor Temple": {
      name: "Luxor Temple Pylon",
      location: "Ancient Thebes",
      era: "Built by Ramesses II, 1279 BCE",
      desc: "Unlike other temples in Thebes, Luxor was not dedicated to a cult god or a deified king in death. Instead, it was dedicated to the rejuvenation of kingship; it may have been where many of the kings of Egypt were actually crowned.",
      guideTip: "You're looking at one of Egypt's finest examples of New Kingdom architecture! Flanked by colossal seated statues of Ramesses II.",
      timeline: [
        { year: "1400 BCE", title: "Amenhotep III", details: "The core temple is constructed, dedicated to the rejuvenation of kingship." },
        { year: "1250 BCE", title: "Ramesses II", details: "The Great Pylon and the seated statues are added to the temple entrance." },
        { year: "332 BCE", title: "Alexander the Great", details: "The sanctuary is rebuilt by the Macedonian conqueror to legitimize his god-king status." }
      ]
    },
    "Karnak Temple": {
      name: "Karnak Temple Complex",
      location: "Precinct of Amun-Re, Luxor",
      era: "Spans from Senusret I (c. 1971 BCE) to Ptolemaic times",
      desc: "The largest religious complex ever constructed by mankind. Dedicated to the Theban Triad of Amun, Mut, and Khonsu.",
      guideTip: "The Hypostyle Hall features 134 colossal columns in 16 rows. Arrive at 08:00 AM for breathtaking light rays slicing through the dust.",
      timeline: [
        { year: "1970 BCE", title: "Middle Kingdom Beginnings", details: "Senusret I lays the foundations of the limestone sanctuary." },
        { year: "1290 BCE", title: "Great Hypostyle Hall", details: "Seti I and Ramesses II erect the majestic forest of Columns." },
        { year: "250 BCE", title: "Ptolemaic Gateways", details: "The outer pylons are completed, cementing Karnak as the heart of empire." }
      ]
    },
    "Valley of the Kings": {
      name: "Valley of the Kings",
      location: "West Bank, Luxor",
      era: "18th to 20th Dynasties (c. 1539–1075 BCE)",
      desc: "A royal burial ground containing over 60 rock-cut tombs, excavated deep into the sun-baked limestone valleys of Al-Qurn.",
      guideTip: "Choose tombs of Seti I or Ramesses V/VI to marvel at perfectly preserved starry astronomical ceilings.",
      timeline: [
        { year: "1500 BCE", title: "Thutmose I", details: "The first Pharaoh to be secretly entombed in the desolate cliff valleys." },
        { year: "1323 BCE", title: "Tutankhamun", details: "The young pharaoh is laid to rest with over 5,000 pristine gold artifacts." },
        { year: "1150 BCE", title: "Ramesses III", details: "Deep tomb galleries are carved with exquisite hymns representing the Book of Gates." }
      ]
    }
  };

  const currentPreset = presetData[landmarkName] || presetData["Luxor Temple"];
  res.json({
    name: currentPreset.name,
    location: currentPreset.location,
    era: currentPreset.era,
    text: `<b>${currentPreset.name}</b> is a masterpiece of architectural layering. Amenhotep III built the inner sanctum, while Ramesses II added the massive pylon and outer courtyard, flanking the entrance with the towering obelisks that once whispered to the stars.`,
    desc: currentPreset.desc,
    guideTip: currentPreset.guideTip,
    timeline: currentPreset.timeline
  });
});

// 4. API: Plan My Tour (Customized Trip Generator)
app.post("/api/gemini/plan", async (req, res) => {
  const { days, departureCity, interests, name } = req.body;
  const username = name || "Ahmed";

  const systemInstruction = `You are Ra, the premium travel generator.
Create a high-end travel itinerary for ${username} departing from ${departureCity || "Cairo"} for ${days || 3} Days.
Focus on ${interests || "History, Nile cruising, Hot Air ballooning"}.
Format the output as clean JSON containing:
- title: A luxurious Egyptology name for the journey
- badge: Custom Level 7 ranking / Explorer title (e.g. "TOMB RAIDER", "NILE VOYAGER")
- days: Array of objects with:
  - id: number
  - title: name of the day (e.g. "Day 1: The Rising Sun")
  - items: array of itinerary items with:
    - time: string
    - title: place or activity
    - description: luxury, informative description
    - duration: string (e.g. "3h" or "2h")
    - transport: string (e.g. "Private Transfer", "10m Walk")
    - rating: number of stars (1 to 3)
    - imgUrl: hotlinked relevant travel image (or empty string)`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a structured ${days || 3}-day luxury itinerary emphasizing: ${interests}. Return clean JSON.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini Plan generator error, falling back to rich static dataset:", err);
    }
  }

  // Simulated fallback response
  res.json({
    title: `Your Luxor Soul-Journey`,
    badge: "3 DAYS IN THE CITY OF HUNDRED GATES",
    days: [
      {
        id: 1,
        title: "Day 1: The Rising Sun",
        items: [
          {
            time: "08:00 AM",
            title: "Karnak Temple Complex",
            description: "Step where pharaohs were crowned. Explore the majestic hypostyle column jungle under morning sunbeams.",
            duration: "3h",
            transport: "Private Transfer",
            rating: 3,
            imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrDoHEygln8SGalQJFXk6M6-hLKOM4Zrh1IP9_C1zuUkA0YtYwKuwW3LN4q_KfUajtnDLDJ_n00Z-oZMDlEZccAy2SEV-R6y_GSZdYu5PrioOMCP9sf4Q0FLJUYh66a2yo6G7Vnl6AzvKGgtU2F8ouaWrs4AYC93Eh9LVc4h1dmPFj50Q_yWd9iXpSUNdx6VJSoVdAax809w0UN-pU_20Ad9_qNawB1I8_al1UgehMsIBS_nTXDSsp5mN9Tej-bX-cfJEf8GmUQac",
          },
          {
            time: "01:00 PM",
            title: "Lunch at Al-Sahaby Lane",
            description: "Traditional rooftop dining overlooking the historic Avenue of Sphinxes.",
            duration: "1h 30m",
            transport: "10m Walk",
            rating: 2,
            imgUrl: "",
          },
          {
            time: "05:00 PM",
            title: "Luxor Temple Twilight",
            description: "Witness the obelisks turn pure golden-bronze. The ambient spotlights flare onto colossal pharaoh statues as dusk falls.",
            duration: "2h",
            transport: "Private Guide",
            rating: 3,
            imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnZTT8btafKOthlDpYKz8m9KviIYhUP2x-TbbmyvjSKtRdi9YxsdKszrKbOD75V4MqhjPgyeBT9S7jDK8xTv6yuMYuoGyLWqI7g870T0yMg8E0LCDJjaijJ8Q7-HZJdcKWE8eRhd2nnJN9kLcO96N9SBvwzv_N6EkSFtukw8EQEBqqn1Jt1ENgssgnEIqZocVyRo4OsGQQ1Ia3oQFi77geSasK_l4ERO8Bx4VZ0RQ6uwjAK20R3M_Xzbqx5_nMCjy0reau7NpNXBM",
          },
        ],
      },
      {
        id: 2,
        title: "Day 2: Realm of the West",
        items: [
          {
            time: "05:30 AM",
            title: "Hot Air Balloon Flight",
            description: "Rise thousands of feet above the West Bank cliffs & Colossi of Memnon while the sun rises over the Nile.",
            duration: "2h",
            transport: "Shuttle & Boat",
            rating: 3,
            imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9q_PzWHaofqAs_tCs8DGX7dkJUt0axfxTLA-O1F6pkuFcJaq_A2_aORISFL4WeltQOXp5VBYpwhsUdVxx-MvZRfiK-oBMsDI7vrA08cN3dfIjtqcBHSKlUBVFnCe2k2Arl4B2a59vstwvjpruQeHHH-btwNngikxfFMJfho8OXS9pmEbKhpo66Y9jCI_XNoNSHVzqMNR42stvIleIQqhSmxYJWuJcgsyhKAXljJkHIhCOnytBR92Kp84XNYdxEgM7KaBw70YvqTM",
          },
          {
            time: "08:30 AM",
            title: "Valley of the Kings Excavations",
            description: "Venture deep tomb shafts of Egypt's greatest monarchs who chose eternal limestone tombs over towering pyramids.",
            duration: "4h",
            transport: "Private Transfer",
            rating: 3,
            imgUrl: "",
          },
        ],
      },
      {
        id: 3,
        title: "Day 3: Echoes of Eternity",
        items: [
          {
            time: "09:00 AM",
            title: "Temple of Hatshepsut",
            description: "Cradled against the giant cliffs of Deir el-Bahari, this three-tiered terrace temple represents a masterclass of human symmetry.",
            duration: "2h 30m",
            transport: "Private Transfer",
            rating: 3,
            imgUrl: "",
          },
          {
            time: "05:30 PM",
            title: "Sunset Felucca Sail",
            description: "Decompress by drifting on traditional linen-winged sailboats as the ancient stars appear over Elephantine Island.",
            duration: "2h",
            transport: "Scenic Nile Boat",
            rating: 3,
            imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5yLpv_Q4aHE0eFSj9Leg2uJdTaZllPT1BQbQ5Fv_v8F_AyP8FULmAFEWrP9I3I11o_BgpUXai2lvrgX05CimO_hX378xoOXf9S3Vi784vrP98n-6sMkw6v3ZrIyeDw6as5A7LGXnOF3LQyTjZs0TDSvhumzP-6wTzpIHpbY7kvfxt7Ee8gfWhjuT8UsoKwMCjpWb_M4-7yRog55FQChItfzw3O0pLUpBMtKYSmaNVHnby5t6veFJxDBHe9yVvf2SiPS5x6Ie7B6g",
          },
        ],
      },
    ],
  });
});

// Configure Vite or Static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rihla Companion Server successfully operating on http://localhost:${PORT}`);
  });
}

startServer();
