'use server'

import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { NextResponse } from "next/server";

export const getAnswer = async (question : string) => {
    try {
        const embeddings = new OllamaEmbeddings({
      model: "embeddinggemma",
      baseUrl: "http://localhost:11434",
    });
    const pinecone = new PineconeClient({
    //   apiKey: process.env.PINECONE_API_KEY!,
    apiKey :'pcsk_ttJpZ_MsqBHYossTVpMWd34W3jjUTs7wFgEnx5VMSDeaJ76jonPn3FJsgSyaQDasFr37K'
    });
    const pineconeIndex = pinecone.Index(
    //   process.env.PINECONE_INDEX_NAME!
    'chat-bot'
    );

    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex,
    });
    const retriever = vectorStore.asRetriever({
      k: 5,
      // Example metadata filter (optional)
      // filter: { category: "projects" }
    });
    const docs = await retriever.batch([question]);
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
      baseUrl: "http://localhost:11434",
      temperature: 0.2,
    });
const chain = prompt
      .pipe(llm)
      .pipe(new StringOutputParser());
      const answer = await chain.invoke({
      context,
      question,
    });
    // console.log(answer)
    return NextResponse.json({ answer, citations});
    } catch (error) {
        console.log(error);
        return NextResponse.json({
      answer: "Something went wrong while generating the answer.",
      citations: [],
    });
    }
}