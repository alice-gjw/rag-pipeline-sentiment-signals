# Simple logger

import logging
import sys
from pathlib import Path

# src/config/logging_config.py 
# .parent.parent = src/
# .parent.parent.parent = project-root/
PROJECT_ROOT = Path(__file__).parent.parent.parent
LOG_FILE = PROJECT_ROOT / "logs" / "rag.log"

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
