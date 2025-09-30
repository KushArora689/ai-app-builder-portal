import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("youre connected to db");
});

// this will be savedd in the db
const GeneratedAppSchema = new mongoose.Schema({
  description: String,
  appName: String,
  navbar: [String],
  roles: [String],
  pages: [mongoose.Schema.Types.Mixed],
  navbarPages: mongoose.Schema.Types.Mixed, 
});

const Requirement = mongoose.model("Requirement", GeneratedAppSchema);

app.post("/api/requirements", async (req, res) => {
  try {
    const { description } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 
      
`You are an AI that generates app specifications as JSON.

The user will describe the app in natural language. Generate a JSON including:

1. "appName" (string)
2. "navbar" (array of strings) — at least 3 meaningful items if possible
3. "roles" (array of strings) — must exist
4. "pages" (array of objects) — each page has:
   - "name", "role", "type" ("table"|"form")
   - "columns" (strings) if type table
   - "fields" (strings) if type form
   - "data" (mock data)
5. "navbarPages" — an object mapping each navbar item to the page names that belong to it. Home can include an overview or all pages.

Example:

{
  "appName": "Library Manager",
  "navbar": ["Home", "Manage Books", "Member Services", "Reports"],
  "roles": ["Librarian", "Member", "Admin"],
  "navbarPages": {
    "Home": ["Home Overview"],
    "Manage Books": ["Add Book", "Borrow Book", "Return Book", "List Books"],
    "Member Services": ["Register Member", "Member Profile"],
    "Reports": ["Overdue Books", "Popular Titles"]
  },
  "pages": [
    {
      "name": "Add Book",
      "role": "Librarian",
      "type": "form",
      "fields": ["Title", "Author", "ISBN", "Copies"]
    }
  ]
}

IMPORTANT: Always respond ONLY with JSON.`

          },
          { role: "user", content: description },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let text = response.data.choices[0].message.content;
    const parsed = JSON.parse(text);

    
    const saved = await Requirement.create({ description, ...parsed });
    res.json(saved);
  

  } catch (err) {
    console.error("error generating requirements :((((", err.message);
    res.status(500).json({ error: "failed to process requirements" });
  }
});

// get all saved requirements
app.get("/api/requirements", async (req, res) => {
  const list = await Requirement.find();
  res.json(list);
});

const PORT = process.env.PORT || 5000;
console.log(" OpenAI key loaded?", process.env.OPENAI_API_KEY ? "yup" : "nup");
app.listen(PORT, () => console.log(` server running on port ${PORT}`));
