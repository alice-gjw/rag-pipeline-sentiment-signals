import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from backend.ingestion.embed import get_collection

load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
)

SCORING_PROMPT = """You are a crypto governance analyst. Given historical governance
proposals and their price impacts, predict how this new event will affect the token price.

Historical context from similar proposals:
{context}

New event to analyze:
{event}

Based on the price changes from similar past proposals, predict the expected price impact.

Return JSON only (no markdown, no explanation outside JSON):
{{
  "prediction": <float between -1.0 and +1.0, e.g. -0.05 means -5% price change>,
  "confidence": <float between 0.0 and 1.0, e.g. 0.7 means 70% confident>,
  "reasoning": "one sentence explanation"
}}

Example output:
{{"prediction": -0.03, "confidence": 0.75, "reasoning": "Similar reward reduction proposals caused 2-4% drops"}}
"""


def retrieve_similar_proposals(query: str, k: int = 5):
    """Retrieve similar proposals from all spaces."""
    collection = get_collection()

    results = collection.query(
        query_texts=[query],
        n_results=k,
        include=["documents", "metadatas"]
    )

    return results


def score_event(event_description: str) -> dict:
    """Score a governance event's predicted price impact."""
    results = retrieve_similar_proposals(event_description)

    context_parts = []
    sources = []

    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        title = doc.split("\n")[0].replace("Title: ", "")
        space = meta.get("protocol", "unknown").upper()
        proposal_label = f"[{space}] {title}"

        price_change = None
        price_info = ""
        if meta.get("price_at_start") and meta.get("price_at_end"):
            start = meta["price_at_start"]
            end = meta["price_at_end"]
            price_change = ((end - start) / start) * 100 if start else 0
            price_info = f"Price change during vote: {price_change:+.1f}%"

        context_parts.append(f"{proposal_label}\n{doc[:500]}\n{price_info}")
        sources.append({
            "proposal": proposal_label,
            "price_change": round(price_change, 2) if price_change else None
        })

    context = "\n---\n".join(context_parts)

    prompt = SCORING_PROMPT.format(
        context=context,
        event=event_description
    )

    response = llm.invoke(prompt)

    try:
        result = json.loads(response.content)
    except json.JSONDecodeError:
        result = {"prediction": 0.0, "confidence": 0.0, "reasoning": "Failed to parse response"}

    result["sources"] = sources

    return result


if __name__ == "__main__":
    result = score_event(
        "Proposal to reduce staking rewards by 50%"
    )
    print(json.dumps(result, indent=2))
