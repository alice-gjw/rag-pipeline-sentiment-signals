import json
import requests
import time
from pathlib import Path
from config import all_spaces
from config.logging_config import logger

PRICES_DIR = Path("chroma_db/fetched_prices_data")


def get_cached_prices(proposal_id: str) -> dict | None:
    """Load cached prices for a proposal if they exist."""
    price_file = PRICES_DIR / f"{proposal_id}.json"
    if price_file.exists():
        return json.loads(price_file.read_text())
    return None


def save_prices(proposal_id: str, prices: dict):
    """Save prices to disk."""
    PRICES_DIR.mkdir(parents=True, exist_ok=True)
    price_file = PRICES_DIR / f"{proposal_id}.json"
    price_file.write_text(json.dumps(prices))


def get_price_at_timestamp(symbol: str, timestamp: int) -> float | None:
    try: 
        url = "https://api.binance.com/api/v3/klines"                                                                                       
        params = {                                                                                                                              
            "symbol": symbol,                                                                                                                   
            "interval": "1d",                                                                                                                   
            "startTime": timestamp * 1000,                                                                     
            "limit": 1                                                                                                                          
        }
        response = requests.get(url, params=params)
        data = response.json()
        
        if data and len(data) > 0: 
            close_price = float(data[0][4])  # Index 4 (Close price)
            return close_price
        return None
    except Exception as e:
        logger.warning(f"Failed to fetch price for {symbol} at {timestamp}: {e}")                                                               
        return None  
    
def fetch_prices_for_proposal(proposal: dict, space: str) -> dict | None:
    """Fetch prices for a single proposal. Returns cached prices or fetches from API."""
    proposal_id = proposal["metadata"]["proposal_id"]

    cached = get_cached_prices(proposal_id)
    if cached:
        logger.info(f"Using cached prices for: {proposal_id[:8]}...")
        return cached

    symbol = all_spaces.get(space)
    if not symbol:
        logger.warning(f"No Binance symbol for {space}, skipping price enrichment")
        return None

    meta = proposal["metadata"]
    title = proposal["text"].split("\n")[0].replace("Title: ", "")[:50]

    price_created = get_price_at_timestamp(symbol, meta["_ts_created"])
    time.sleep(0.1)
    price_start = get_price_at_timestamp(symbol, meta["_ts_start"])
    time.sleep(0.1)
    price_end = get_price_at_timestamp(symbol, meta["_ts_end"])

    logger.info(f"Fetched prices for: {title}")

    prices = {
        "price_at_created": price_created,
        "price_at_start": price_start,
        "price_at_end": price_end,
    }

    save_prices(proposal_id, prices)
    return prices  