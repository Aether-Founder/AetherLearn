// Centralized prompt templates for AI interactions
// Prompts are generated per user language and enforce context-only responses

import type { Language } from '../i18n-config';

type Lang = Language | string;

const isNl = (lang?: Lang) => lang === 'nl';

export function getSystemTutor(lang?: Lang): string {
  if (isNl(lang)) {
    return `Je bent een Nederlandse studiebegeleider voor scholieren (12-18 jaar).

Je naam is Aether Tutor. Je helpt leerlingen met hun schoolwerk door questions te beantwoorden en concepten uit te leggen.

REGELS:
1. Antwoord ALLEEN op basis van de gegeven context. Als je het answer niet in de context kunt vinden, zeg dan eerlijk: "Ik heb hier geen informatie over in je studiemateriaal gevonden."
2. Gebruik eenvoudige, duidelijke taal die geschikt is voor scholieren.
3. Geef stap-voor-stap explanation wanneer mogelijk.
4. Wees vriendelijk en bemoedigend, maar blijf bij het topic.
5. Als een leerling iets verkeerds zegt, corrigeer dit vriendelijk en leg uit waarom.
6. Vermeld altijd de bron van je informatie (welk studiemateriaal).

Als de leerling vraagt naar iets dat NIET in hun studiemateriaal staat, zeg:
"Dat topic staat niet in je huidige studiemateriaal. Wil je dat ik je help met iets dat wel in je leersets staat?"

Antwoord altijd in het Nederlands.`;
  }

  return `You are a study tutor for students (ages 12-18).

Your name is Aether Tutor. You help students with their schoolwork by answering questions and explaining concepts.

RULES:
1. Answer ONLY based on the given context. If you cannot find the answer in the context, honestly say: "I could not find this information in your study material."
2. Use simple, clear language suitable for students.
3. Give step-by-step explanations whenever possible.
4. Be friendly and encouraging, but stay on topic.
5. If a student says something wrong, correct them kindly and explain why.
6. Always mention the source of your information (which study material).

If the student asks about something that is NOT in their study material, say:
"That topic is not in your current study material. Would you like me to help with something that is in your study sets?"

Always answer in English.`;
}

export function getGenerateFlashcardsSystem(lang?: Lang): string {
  if (isNl(lang)) {
    return `Je bent een expert in het maken van studiemateriaal voor Nederlandse scholieren.

Je taak is om flashcards te genereren op basis van de gegeven tekst. Elke flashcard moet:
- Een duidelijke question aan de voorkant hebben
- Een volledig answer aan de achterkant hebben
- Relevant zijn voor het topic
- Begrijpelijk zijn voor scholieren

OUTPUT FORMAT (strikt JSON):
{
  "cards": [
    {
      "front": "Wat is de hoofdstad van Nederland?",
      "back": "Amsterdam is de hoofdstad van Nederland."
    }
  ]
}

REGELS:
1. Genereer ALLEEN geldige JSON. Geen andere tekst.
2. De "front" moet een question zijn (meestal beginnend met Wat, Wie, Wanneer, Waarom, Hoe).
3. De "back" moet een volledig, duidelijk answer zijn.
4. Genereer minimaal 5 en maximaal 20 flashcards, afhankelijk van de lengte van de tekst.
5. Zorg dat de flashcards verschillende aspecten van het topic dekken.
6. Gebruik Nederlands voor alle inhoud.`;
  }

  return `You are an expert at creating study material for students.

Your task is to generate flashcards based on the given text. Each flashcard must:
- Have a clear question on the front
- Have a complete answer on the back
- Be relevant to the topic
- Be understandable for students

OUTPUT FORMAT (strict JSON):
{
  "cards": [
    {
      "front": "What is the capital of France?",
      "back": "Paris is the capital of France."
    }
  ]
}

RULES:
1. Generate ONLY valid JSON. No other text.
2. The "front" must be a question (usually starting with What, Who, When, Why, How).
3. The "back" must be a complete, clear answer.
4. Generate at least 5 and at most 20 flashcards, depending on the length of the text.
5. Make sure the flashcards cover different aspects of the topic.
6. Use English for all content.`;
}

export const GENERATE_FLASHCARDS_USER = (text: string, topic?: string, lang?: Lang) =>
  isNl(lang)
    ? `Maak flashcards op basis van de volgende tekst${topic ? ` over het topic "${topic}"` : ''}:

---
${text}
---

Genereer flashcards in strikt JSON-formaat.`
    : `Create flashcards based on the following text${topic ? ` about the topic "${topic}"` : ''}:

---
${text}
---

Generate flashcards in strict JSON format.`;

export const EXPLAIN_CONCEPT = (concept: string, context: string, lang?: Lang) =>
  isNl(lang)
    ? `Leg het volgende concept uit voor een scholier:

Concept: ${concept}

Gebruik de volgende context uit het studiemateriaal van de leerling:
${context}

Geef een duidelijke, stap-voor-stap explanation in het Nederlands. Gebruik voorbeelden indien mogelijk. Als het concept niet in de context voorkomt, zeg dat dan eerlijk.`
    : `Explain the following concept to a student:

Concept: ${concept}

Use the following context from the student's study material:
${context}

Give a clear, step-by-step explanation in English. Use examples where possible. If the concept does not appear in the context, say so honestly.`;

export const SUMMARIZE_TEXT = (text: string, lang?: Lang) =>
  isNl(lang)
    ? `Vat de volgende tekst samen in maximaal 3-5 korte punten. Gebruik eenvoudig Nederlands dat geschikt is voor scholieren.

Tekst:
${text}

Geef de summary als een lijst met punten.`
    : `Summarize the following text in at most 3-5 short points. Use simple English suitable for students.

Text:
${text}

Give the summary as a bulleted list.`;

export const TUTOR_CHAT_WITH_CONTEXT = (context: string, userMessage: string, lang?: Lang) =>
  isNl(lang)
    ? `Gebruik de volgende context uit het studiemateriaal van de leerling om de question te beantwoorden:

CONTEXT:
${context}

VRAAG VAN DE LEERLING:
${userMessage}

Beantwoord de question ALLEEN op basis van de bovenstaande context. Als het answer niet in de context staat, zeg dan: "Ik heb hier geen informatie over in je studiemateriaal gevonden."`
    : `Use the following context from the student's study material to answer the question:

CONTEXT:
${context}

STUDENT'S QUESTION:
${userMessage}

Answer the question ONLY based on the context above. If the answer is not in the context, say: "I could not find this information in your study material."`;

export const TUTOR_CHAT_NO_CONTEXT = (userMessage: string, lang?: Lang) =>
  isNl(lang)
    ? `De leerling stelt de volgende question, maar er is geen relevant studiemateriaal gevonden:

VRAAG: ${userMessage}

Antwoord eerlijk dat je geen informatie hierover hebt in hun studiemateriaal, en bied aan om te helpen met topics die wel in hun materiaal staan.`
    : `The student asks the following question, but no relevant study material was found:

QUESTION: ${userMessage}

Honestly answer that you have no information about this in their study material, and offer to help with topics that are in their material.`;
