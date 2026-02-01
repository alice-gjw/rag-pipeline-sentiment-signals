# RAG Pipeline for Crypto Governance Sentiment Signals

Query historical governance proposals to understand how similar events affected token prices.

## Overview

When similar governance events happened in the past, what did the token price do? This pipeline:
1. Fetches closed governance proposals from Snapshot
2. Enriches them with token prices at 3 key timestamps (creation, voting start, voting end)
3. Embeds and stores in ChromaDB for semantic search
4. Enables RAG-based sentiment scoring for new governance events

## Two Pipelines

### 1. Ingestion Pipeline (Scrape Data)

Fetches proposals, enriches with prices, and stores embeddings.

```bash
python -m backend.ingestion.main
```

```
┌─────────────────────┐
│  Snapshot GraphQL   │  Fetch closed proposals 
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Binance API       │  Get token prices at 3 timestamps per proposal
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Chunking          │  Split proposal text (800 chars, 150 overlap)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Embedding         │  Create embeddings + metadata docs
│   (ChromaDB)        │  - snapshot_proposals (content chunks)
└─────────────────────┘  - proposal_metadata (timing/prices)
```

### 2. Query Pipeline (Agent Prediction)

Query similar proposals and get price impact predictions.

```bash
python -m backend.agent.rag_sentiment_scoring
```

```
┌─────────────────────┐
│   User Query        │  "Proposal to reduce staking rewards by 50%"
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Similarity Search  │  Find similar proposals in ChromaDB
│   (ChromaDB)        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Agent (Groq LLM)  │  Analyze historical price impacts
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Output            │  Prediction + confidence + sources
└─────────────────────┘
```

**Example output:**
```json
{
  "prediction": -0.04,
  "confidence": 0.75,
  "reasoning": "Similar staking reward reductions led to 3-5% price drops",
  "sources": [
    {"proposal": "[AAVE] Reduce Safety Module staking rewards", "price_change": -3.2},
    {"proposal": "[LIDO] Adjust staking APR parameters", "price_change": -1.8}
  ]
}
```

**Usage in code:**
```python
from backend.agent.rag_sentiment_scoring import score_event

result = score_event("Proposal to reduce staking rewards by 50%")
print(result)
```

## Supported Spaces

Configured in `config/spaces.yaml`:

| Space | Token |
|-------|-------|
| aave.eth | AAVE |
| uniswapgovernance.eth | UNI |
| lido-snapshot.eth | LDO |
| ens.eth | ENS |
| arbitrumfoundation.eth | ARB |
| opcollective.eth | OP |
| balancer.eth | BAL |
| sushi.eth | SUSHI |
| curve.eth | CRV |
| 1inch.eth | 1INCH |

## Installation

```bash
# Install dependencies
uv sync

# Create .env file with Groq API key (for query pipeline)
echo "GROQ_API_KEY=your_key_here" > .env
```

## Project Structure

```
├── config/
│   ├── __init__.py          # Loads spaces.yaml
│   ├── spaces.yaml          # Snapshot space → Binance symbol mapping
│   └── logging_config.py
├── backend/
│   ├── ingestion/
│   │   ├── main.py                # Ingestion pipeline entrypoint
│   │   ├── snapshot_scraping.py   # Fetch proposals from Snapshot
│   │   ├── price_fetcher.py       # Get prices from Binance
│   │   ├── chunk.py               # Split documents
│   │   └── embed.py               # Embed and store in ChromaDB
│   └── agent/
│       └── rag_sentiment_scoring.py  # Query pipeline + LLM scoring
└── README.md
```

## Tech Stack

- **Snapshot API** - Governance proposals
- **Binance API** - Historical token prices
- **ChromaDB** - Vector database
- **SentenceTransformers** - Embeddings (all-MiniLM-L6-v2)
- **Groq** - LLM inference (llama-3.1-8b-instant)
- **LangChain** - Text splitting + LLM integration
