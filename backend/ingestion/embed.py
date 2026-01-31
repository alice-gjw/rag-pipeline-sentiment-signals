from config.logging_config import logger
import chromadb
from chromadb.utils import embedding_functions


def embed_documents(chunked_docs, batch_size=500):
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name= "all-MiniLM-L6-v2"
    )

    client = chromadb.PersistentClient(path="./chroma_db")

    collection = client.get_or_create_collection(
        name="crypto_governance",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"}
    )

    for i in range(0, len(chunked_docs), batch_size):
        batch = chunked_docs[i:i + batch_size]
        collection.add(
            ids=[f"doc_{i+j}" for j in range(len(batch))],
            documents=[b["text'"] for b in batch],
            metadatas=[b["metadata"] for b in batch]
        )
    
    logger.info(f"Stored {collection.count()} chunks in ChromaDB")