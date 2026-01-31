from config.logging_config import logger
import chromadb
from chromadb.utils import embedding_functions


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

def embed_documents(chunked_docs, batch_size=500):
    collection = get_collection()
    logger.info(f"Embedding {len(chunked_docs)} chunks")
    
    for i in range(0, len(chunked_docs), batch_size):
        batch = chunked_docs[i:i + batch_size]
        collection.add(
            ids=[f"doc_{collection.count() + j}" for j in range(len(batch))],
            documents=[b["text"] for b in batch],
            metadatas=[b["metadata"] for b in batch]
        )
        
        logger.info(f"Total chunks in ChromaDB: {collection.count()}")