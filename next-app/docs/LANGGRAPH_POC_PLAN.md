# LangGraph POC Implementation Plan

## 1. Objectives
- Integrate LangGraph as an agentic orchestration layer for CV review AI workflows.
- Support streaming, fallback, and modular node/edge logic.
- Ensure safety, prompt sanitization, and observability.

## 2. Scope
- Replace or wrap current AI orchestration (Gemini primary, HuggingFace fallback) with LangGraph.
- Implement a minimal graph: Input → Sanitization → AI Node (Gemini) → Fallback Node (HuggingFace) → Output.
- Enable streaming responses to client.
- Integrate error handling, safety checks, and logging.

## 3. Architecture
- **Graph Nodes:**
  - Input Node: Accepts user CV and parameters.
  - Sanitization Node: Applies prompt injection prevention and formatting.
  - AI Node: Calls Gemini API (streaming, with config).
  - Fallback Node: Calls HuggingFace if Gemini fails.
  - Output Node: Formats and returns response.
- **Edges:**
  - Success: Normal flow.
  - Failure: Route to fallback or error node.

## 4. Integration Points
- API route: `next-app/app/api/cv-review/generate/route.ts`
- AI logic: `next-app/lib/ai/gemini.ts`, `next-app/lib/ai/huggingface.ts`
- Sanitization: `next-app/lib/sanitize.ts`
- Observability: `next-app/lib/monitoring.ts`

## 5. Implementation Steps
1. Install LangGraph and dependencies.
2. Create `lib/ai/langgraph-adapter.ts` for the graph definition.
3. Implement nodes: input, sanitization, Gemini, fallback, output.
4. Add streaming support in nodes and API route.
5. Integrate error handling and logging.
6. Wire up to API route for CV review.
7. Test with various CVs and edge cases.
8. Document architecture and usage.

## 6. Success Criteria
- Streaming CV review responses via LangGraph.
- Fallback to HuggingFace on Gemini error.
- Sanitization and safety checks enforced.
- Observability/metrics captured.
- No regression in output quality or latency.

## 7. Next Steps
- Review and refine plan.
- Proceed to prototyping (`lib/ai/langgraph-adapter.ts`).
