from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.logging_config import logger

def chunk_documents(all_docs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " "]
    )

    chunked_docs = []
    logger.info("")
    logger.info(f"Total documents to chunk: {len(all_docs)}")
    logger.info("Chunking starting ... ")
    
    for doc in all_docs: 
        chunks = text_splitter.split_text(doc["text"])
        for i, chunk in enumerate(chunks): 
            chunked_docs.append({
                "text": chunk, 
                "metadata": {**doc["metadata"], "chunk_index": i}
            })
            if len(chunked_docs) % 100 == 0: 
                logger.info(f"Chunk {len(chunked_docs)} example: ")
                logger.info(chunk[:100])
                logger.info(chunked_docs[-1])
    logger.info(f"Total chunks: {len(chunked_docs)}")
    logger.info("")
    return chunked_docs