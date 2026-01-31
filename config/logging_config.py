# Simple logger, only logging info

import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO, 
        format='%(asctime)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("logs/rag.log")
        ]
    )

setup_logging()

logger = logging.getLogger("rag")
