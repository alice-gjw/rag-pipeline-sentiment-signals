# RAG Pipeline for Crypto Governance Sentiment Signals

Predict how governance events will affect token prices based on historical proposals.

## Quick Start

### 1. Setup

```bash
# Install dependencies
uv sync

# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env
```

### 2. Ingest Data (one-time)

```bash
python -m backend.ingestion.main
```

This fetches proposals from Snapshot, enriches with Binance price data, and stores embeddings locally in ChromaDB.

### 3. Run the App

```bash
python -m frontend.app
```

Open `http://127.0.0.1:7860` in your browser.

## How It Works

```
User Query: "Proposal to reduce staking rewards by 50%"
                    |
                    v
        +---------------------+
        |  ChromaDB Search    |  Find similar historical proposals
        +---------------------+
                    |
                    v
        +---------------------+
        |  Groq LLM (Llama)   |  Analyze price impacts from similar events
        +---------------------+
                    |
                    v
        Prediction: -4.0%, Confidence: 75%
        Sources: [AAVE] Reduce staking rewards (-3.2%), ...
```

## Project Structure

```
backend/
  ingestion/
    main.py              # Ingestion pipeline
    snapshot_scraping.py # Fetch proposals from Snapshot
    price_fetcher.py     # Get prices from Binance
    chunk.py             # Split documents
    embed.py             # Store in ChromaDB
  agent/
    rag_sentiment_scoring.py  # RAG + LLM scoring

frontend/
  app.py                 # Gradio web interface

config/
  spaces.yaml            # Snapshot space to Binance symbol mapping

chroma_db/               # Vector database (created on first run)
  fetched_prices_data/   # Cached price data
```

## Adding Protocols

Edit `config/spaces.yaml` to add or remove protocols:

```yaml
spaces:
  aavedao.eth: AAVEUSDT        # Snapshot space: Binance trading pair
  uniswapgovernance.eth: UNIUSDT
  your-dao.eth: TOKENUSDT      # Add your own
```

To find the values:
1. **Snapshot space**: Go to snapshot.org, find your DAO, copy the space ID from the URL (e.g., `aavedao.eth`)
2. **Binance symbol**: Find the USDT trading pair on Binance (e.g., `AAVEUSDT`)

After editing, re-run ingestion to fetch the new proposals:
```bash
python -m backend.ingestion.main
```

## Environment Variables

```
GROQ_API_KEY=xxx     # Required - for LLM predictions
HF_TOKEN=xxx         # Optional - suppresses HuggingFace warnings
```

## Tech Stack

- Snapshot API - Governance proposals
- Binance API - Historical token prices
- ChromaDB - Vector database
- SentenceTransformers - Embeddings (all-MiniLM-L6-v2)
- Groq - LLM inference (llama-3.1-8b-instant)
- Gradio - Web interface
