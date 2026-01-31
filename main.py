from config.logging_config import logger
from backend.ingestion.snapshot_scraping import fetch_snapshot_proposals
from backend.ingestion.chunk import chunk_documents
from backend.ingestion.embed import embed_documents


def main(spaces):
    all_docs = []
    for space in spaces: 
        proposals = fetch_snapshot_proposals(space)
        all_docs.extend(proposals)
        logger.info(f"{space}: {len(proposals)} proposals")
        
    chunked_docs = chunk_documents(all_docs)
    embed_documents(chunked_docs)
    