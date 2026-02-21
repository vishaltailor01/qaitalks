import os
import httpx
from typing import List, Dict


async def synthesize_recommendations(cv_text: str, top_chunks: List[Dict]) -> List[str]:
    """Call configured LLM to synthesize recommendations from CV + retrieved chunks.

    Environment:
    - LLM_URL: full HTTP endpoint to call (POST JSON {"prompt": ...}).
    If `LLM_URL` is not set or call fails, fall back to a lightweight heuristic.
    """
    llm_url = os.getenv("LLM_URL")

    # Build a compact prompt
    prompt_chunks = []
    for c in top_chunks[:6]:
        content = c.get("content", "") or ""
        prompt_chunks.append(f"- {content[:400].strip()}")

    prompt = (
        "You are an assistant that reviews a candidate CV and suggests improvements, skill gaps, "
        "and mapping to relevant training modules.\n\n"
        "CV:\n" + cv_text[:2000] + "\n\n"
        "Top relevant knowledge snippets:\n" + "\n".join(prompt_chunks) + "\n\n"
        "Produce 3 concise recommendations (one-per-line), each focusing on a skill, suggested improvement, or mapped micro-credential."
    )

    if llm_url:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(llm_url, json={"prompt": prompt})
                r.raise_for_status()
                j = r.json()
                # Expect either {'text': '...'} or {'choices':[{'text':'...'}]}
                if isinstance(j, dict) and "text" in j:
                    text = j["text"]
                elif isinstance(j, dict) and "choices" in j and j["choices"]:
                    text = j["choices"][0].get("text", "")
                else:
                    text = str(j)
                # split into lines and return top 5
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                return lines[:5]
        except Exception:
            # fall through to heuristic
            pass

    # Heuristic fallback: extract first clauses from top 3 chunks
    recs = []
    for c in top_chunks[:3]:
        txt = (c.get("content") or "").strip()
        if not txt:
            continue
        # choose a short fragment
        frag = txt.split(".\n")[0].split(".")[0].strip()
        if frag:
            recs.append(f"Consider emphasizing: {frag}.")
    if not recs:
        recs = ["No strong matches found; consider adding explicit skills and certifications."]
    return recs
