from config import all_spaces
from config.logging_config import logger
from backend.ingestion.snapshot_scraping import fetch_snapshot_proposals
from backend.ingestion.price_fetcher import fetch_prices_for_proposal, get_cached_prices
from backend.ingestion.chunk import chunk_documents
from backend.ingestion.embed import get_existing_proposal_ids, embed_documents


def main(spaces):
    logger.info("")
    embedded_ids = get_existing_proposal_ids()
    logger.info(f"Found {len(embedded_ids)} already embedded proposals")

    new_proposals = []
    for space in spaces:
        proposals = fetch_snapshot_proposals(space)
        unseen = [p for p in proposals if p["metadata"]["proposal_id"] not in embedded_ids]
        new_proposals.extend(unseen)
        logger.info(f"{space}: {len(unseen)} new / {len(proposals)} total")

    if not new_proposals:
        logger.info("No new proposals to process")
        return

    to_fetch = sum(1 for p in new_proposals if not get_cached_prices(p["metadata"]["proposal_id"]))
    logger.info(f"Fetching prices: {to_fetch} from API, {len(new_proposals) - to_fetch} cached")

    counter = [0, to_fetch]
    for proposal in new_proposals:
        space = proposal["metadata"]["protocol"] + ".eth"
        prices = fetch_prices_for_proposal(proposal, space, counter)
        if prices:
            proposal["metadata"].update(prices)

    chunked_docs = chunk_documents(new_proposals)
    embed_documents(chunked_docs)
    logger.info("Ingestion complete")


if __name__ == "__main__":
    main(all_spaces.keys())
