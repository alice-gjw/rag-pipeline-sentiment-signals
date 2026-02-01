from config import all_spaces
from config.logging_config import logger
from backend.ingestion.snapshot_scraping import fetch_snapshot_proposals
from backend.ingestion.price_fetcher import fetch_proposal_metadata_to_embed
from backend.ingestion.chunk import chunk_documents
from backend.ingestion.embed import get_existing_proposal_ids, embed_documents


def main(spaces):
    existing_ids = get_existing_proposal_ids()
    
    all_docs = []
    for space in spaces: 
        proposals = fetch_snapshot_proposals(space)
        proposals = fetch_proposal_metadata_to_embed(proposals, space)
        
        new_proposals = [p for p in proposals if p["metadata"]["proposal_id"] not in existing_ids]
        all_docs.extend(new_proposals)
        logger.info(f"{space}: {len(new_proposals)} new / {len(proposals)} total")
        
        if not all_docs:
            logger.info("No new proposals to process")
            return
        
    chunked_docs = chunk_documents(all_docs)
    embed_documents(chunked_docs)
    logger.info("Ingestion Pipeline Completed")
    
if __name__ == "__main__":
    main(all_spaces.keys()) 