import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
     const req = await request.json();
      const embeddings = new OllamaEmbeddings({
        model: "embeddinggemma",
        baseUrl: process.env.OLLAMA_API_KEY,
      });
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!
    });
    const pineconeIndex = pinecone.Index(
      process.env.PINECONE_INDEX_NAME!
    );
        const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex,
    });
    function routeCategory(question: string): string[] {
      const q = question.toLowerCase();

      if (
        q.includes("who are you") ||
        q.includes("about you") ||
        q.includes("profile")
      ) {
        return ["profile"];
      }

      if (
        q.includes("experience") ||
        q.includes("worked") ||
        q.includes("company") ||
        q.includes("job")
      ) {
        return ["experience"];
      }

      if (
        q.includes("project") ||
        q.includes("built") ||
        q.includes("application") ||
        q.includes("app")
      ) {
        return ["projects"];
      }

      if (
        q.includes("skill") ||
        q.includes("tech") ||
        q.includes("frontend") ||
        q.includes("backend") ||
        q.includes("stack")
      ) {
        return ["skills"];
      }

      if (
        q.includes("education") ||
        q.includes("degree") ||
        q.includes("college")
      ) {
        return ["education"];
      }

      if (
        q.includes("certification") ||
        q.includes("achievement") ||
        q.includes("course")
      ) {
        return ["achievements"];
      }

      // Fallback → search everything
      return [];
    }

    const categories = routeCategory(req.query);
const retriever = vectorStore.asRetriever({
  k: 5,
  ...(categories.length > 0 && {
    filter: {
      category: { $in: categories },
    },
  }),
});
    const docs = await retriever.batch([req.query]);
    const context = docs[0]
      .map(
        (doc, i) => 
             `Source ${i + 1}:
Category: ${doc.metadata.category}
File: ${doc.metadata.fileName}

${doc.pageContent}`
      )
      .join("\n\n");
      const citations = docs[0].map((doc, i) => ({
      index: i + 1,
      category: doc.metadata.category,
      file: doc.metadata.fileName,
      path: doc.metadata.path,
    }));
    const prompt = PromptTemplate.fromTemplate(`
You are an AI assistant answering questions ONLY from the provided context.

Rules:
- If the answer is not in the context, say "I don't have that information yet."
- Be concise and accurate
- Do NOT invent information

Context:
{context}

Question:
{question}

Answer:
`);
 const llm = new ChatOllama({
   model: "llama2",
   baseUrl: process.env.OLLAMA_API_KEY,
   temperature: 0.2,
 });
const chain = prompt
      .pipe(llm)
      .pipe(new StringOutputParser());
      const answer = await chain.invoke({
      context,
      question : req.query,
    });
  return Response.json({ answer, citations })   
    } catch (error) {
      console.log(error)
        return Response.json({ answer: "Something went wrong while generating the answer.",
      citations: [] })  
    }
}