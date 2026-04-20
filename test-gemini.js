import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const keyMatch = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`- ${m.name}`);
      }
    });
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

test();
