// RAG Node for LangGraph: Vector Search using Cloudflare D1 (SQLite)
// This module provides a function to retrieve relevant context from a D1 database for prompt augmentation.

import { generateEmbedding } from './embeddings';
import { DB } from '@cloudflare/d1'; // Placeholder: actual import may differ

// Example schema: d1-schema.sql
// CREATE TABLE knowledge_base (
//   id INTEGER PRIMARY KEY,
//   content TEXT,
//   embedding BLOB
// );

/**
 * Retrieve top-K relevant knowledge base documents for a query using D1 vector search
 * @param {string} query - The user query (e.g., job description, CV, or question)
 * @param {number} topK - Number of documents to retrieve
 * @param {DB} db - Cloudflare D1 database instance
 * @returns {Promise<Array<{ content: string, metadata?: any }>>}
 */
export async function retrieveRAGContextD1(query: string, topK: number = 3, db: DB): Promise<Array<{ content: string, metadata?: any }>> {
  // 1. Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query); // [number[]]

  // 2. Query all embeddings from D1
  const rows = await db.prepare('SELECT id, content, embedding FROM knowledge_base').all();
  // 3. Compute cosine similarity for each row
  const scored = rows.results.map((row: any) => {
    const docEmbedding = JSON.parse(row.embedding); // stored as JSON string
    const score = cosineSimilarity(queryEmbedding, docEmbedding);
    return { content: row.content, metadata: { id: row.id, score } };
  });
  // 4. Sort by score and return topK
  return scored.sort((a, b) => b.metadata.score - a.metadata.score).slice(0, topK);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// Usage: const contextDocs = await retrieveRAGContextD1(query, 3, db);
