from config.logging_config import logger
import chromadb
from chromadb.utils import embedding_functions


def create_metadata_doc(meta):
    """Create a metadata document for embedding (one per proposal)."""
    return f"""Protocol: {meta.get('protocol', 'unknown')}
Proposal ID: {meta.get('proposal_id', 'unknown')}
Created: {meta.get('date_created', 'unknown')}
Voting Start: {meta.get('date_voting_start', 'unknown')}
Voting End: {meta.get('date_voting_end', 'unknown')}
Price at Creation: ${meta.get('price_at_created', 'N/A')}
Price at Vote Start: ${meta.get('price_at_start', 'N/A')}
Price at Vote End: ${meta.get('price_at_end', 'N/A')}
Outcome: {meta.get('outcome', 'unknown')}"""


def get_collection():
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name= "all-MiniLM-L6-v2"
    )
    client = chromadb.PersistentClient(path="./chroma_db")
    
    return client.get_or_create_collection(
        name="crypto_governance",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"}
    )
    
def get_existing_proposal_ids() -> set:
    collection = get_collection()
    existing = collection.get(include=["metadatas"])
    return {meta.get("proposal_id") for meta in existing["metadatas"] if meta.get("proposal_id")}

def embed_documents(chunked_docs):
    """Embed documents with per-proposal atomicity."""
    from itertools import groupby

    collection = get_collection()
    logger.info("")
    logger.info(f"Embedding {len(chunked_docs)} chunks")

    # Group chunks by proposal_id
    chunked_docs_sorted = sorted(chunked_docs, key=lambda x: x["metadata"]["proposal_id"])
    grouped = groupby(chunked_docs_sorted, key=lambda x: x["metadata"]["proposal_id"])

    doc_counter = collection.count()
    successful = 0
    failed = 0

    for proposal_id, chunks in grouped:
        chunks = list(chunks)

        try:
            docs_to_add = []
            metas_to_add = []
            ids_to_add = []

            # Add metadata doc (one per proposal)
            meta = chunks[0]["metadata"]
            metadata_doc = create_metadata_doc(meta)
            docs_to_add.append(metadata_doc)
            metas_to_add.append({**meta, "doc_type": "proposal_metadata"})
            ids_to_add.append(f"meta_{proposal_id}")

            # Add content chunks
            for chunk in chunks:
                docs_to_add.append(chunk["text"])
                metas_to_add.append({**chunk["metadata"], "doc_type": "snapshot_proposals"})
                ids_to_add.append(f"chunk_{doc_counter}")
                doc_counter += 1

            # Embed all chunks for this proposal
            collection.add(ids=ids_to_add, documents=docs_to_add, metadatas=metas_to_add)
            successful += 1

            title = chunks[0]["text"].split("\n")[0].replace("Title: ", "")[:50]
            logger.info(f"Embedded {len(chunks)} chunks for: {title}")

        except Exception as e:
            # Delete any partial chunks for this proposal
            try:
                collection.delete(where={"proposal_id": proposal_id})
            except Exception:
                pass
            failed += 1
            logger.error(f"Failed to embed proposal {proposal_id[:8]}: {e}")
            continue

    logger.info("")
    logger.info(f"Embedding complete: {successful} proposals succeeded, {failed} failed")
    logger.info(f"Total documents in ChromaDB: {collection.count()}")