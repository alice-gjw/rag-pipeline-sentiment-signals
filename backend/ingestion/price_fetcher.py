import requests
import time
from config.logging_config import logger

# Snapshot space -> Binance trading pair                                                                                                        
SPACE_TO_SYMBOL = {                                                                                                                             
    "aave.eth": "AAVEUSDT",                                                                                                                     
    "uniswapgovernance.eth": "UNIUSDT",                                                                                                         
    "lido-snapshot.eth": "LDOUSDT",                                                                                                             
    "ens.eth": "ENSUSDT",                                                                                                                       
    "arbitrumfoundation.eth": "ARBUSDT",                                                                                                        
    "opcollective.eth": "OPUSDT",                                                                                                               
    "balancer.eth": "BALUSDT",                                                                                                                  
    "sushi.eth": "SUSHIUSDT",                                                                                                                   
    "curve.eth": "CRVUSDT",                                                                                                                     
    "1inch.eth": "1INCHUSDT",                                                                                                                   
}    

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
    
def fetch_proposal_metadata_to_embed(documents: list[dict], space:str) -> list[dict]:
        symbol = SPACE_TO_SYMBOL.get(space)
        
        if not symbol: 
            logger.warning(f"No Binance symbol for {space}, skipping price enrichment")                                                             
            return documents 
        
        for doc in documents:
            meta = doc["metadata"]

            # Extract title from text (format: "Title: ...\n\n...")
            title = doc["text"].split("\n")[0].replace("Title: ", "")[:50]

            price_created = get_price_at_timestamp(symbol, meta["_ts_created"])
            time.sleep(0.1)
            price_start = get_price_at_timestamp(symbol, meta["_ts_start"])
            time.sleep(0.1)
            price_end = get_price_at_timestamp(symbol, meta["_ts_end"])

            meta["price_at_created"] = price_created
            meta["price_at_start"] = price_start
            meta["price_at_end"] = price_end

            logger.info(f"Fetched prices for: {title}")                                                                         
        return documents  