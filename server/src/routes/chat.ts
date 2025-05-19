import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY!); //creates a instance of googles gen ai

router.post("/", async (req, res) => {
  const prompt = req.body.prompt;

  const model = genAI.getGenerativeModel({   //selects the model fo genAI
    model: process.env.GEN_AI_MODEL || "gemini-1.5-flash",
  });

  try {
    const resultStream = await model.generateContentStream(prompt); //this generates reponse and send it in chunks

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked"); //this tells browser about

    for await (const chunk of resultStream.stream) { //this will keep sending chunks as it comes
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to stream response" });
  }
});

export default router;
