from langchain.text_splitter import RecursiveCharacterTextSplitter
from logging_config import logger

def chunk_documents(all_docs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " "]
    )

    chunked_docs = []
    for doc in all_docs: 
        logger.info(f"Total documents to chunk: {len(all_docs)}")
        logger.info("Chunking starting ... ")
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
    return chunked_docs