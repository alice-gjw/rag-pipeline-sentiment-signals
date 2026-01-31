import requests
from datetime import datetime
from config.logging_config import logger

# Constructing GraphQL query to send to Snapshot's API 
def fetch_snapshot_proposals(space: str, first: int = 1000) -> list[dict]:
    query = """
    query {
        proposals(
            first: %d, 
            where: {space: "%s", state: "closed"},
            orderBy: "created", 
            orderDirection: desc
        ) {
            id
            title
            body
            choices
            scores
            scores_total
            created
            start
            end
            votes
        }
    }
    """ % (first, space)
    
    response = requests.post(
        "https://hub.snapshot.org/graphql",
        json={"query": query}
    )
    data = response.json()["data"]["proposals"]
    
    documents = []
    for p in data: 
        if p["scores"] and p["choices"]:
            winner_idx = p["scores"].index(max(p["scores"]))
            outcome = p["choices"][winner_idx]
        else:
            outcome = "unknown" 
        
        documents.append({
            "text": f"Title: {p['title']}\n\n{p['body']}",
            "metadata": {
                "source": "snapshot",
                "protocol": space.replace(".eth", ""),
                "date_created": datetime.fromtimestamp(p["created"]).isoformat(),
                "date_voting_start": datetime.fromtimestamp(p["start"]).isoformat(),
                "date_voting_end": datetime.fromtimestamp(p["end"]).isoformat(),
                "state": "closed", 
                "outcome": outcome,
                "votes": p["votes"],
                "scores_total": p["scores_total"],
                "proposal_id": p["id"],
                "doc_type": "governance_proposal"
            }
        })
    return documents