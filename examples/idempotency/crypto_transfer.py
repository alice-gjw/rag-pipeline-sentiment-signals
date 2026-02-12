import redis
import json


r = redis.Redis(host="localhost", port=6379, db=0)


async def execute_blockchain_transfer(from_wallet: str, to_wallet: str, amount: float):
    """Placeholder — this is where you'd sign and broadcast the transaction on-chain."""
    return {
        "tx_hash": "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
        "status": "confirmed",
        "amount": amount,
    }


async def create_transfer(request, idempotency_key: str):
    """
    Process a crypto transfer with idempotency protection.

    The client sends a unique Idempotency-Key header per intent:
        POST /api/transfers
        Headers:
            Idempotency-Key: "txn_user42_20260211_a8f3e1b2"
        Body:
            {"from_wallet": "0xABC...", "to_wallet": "0xDEF...", "amount": 0.5, "token": "ETH"}

    Redis state at each stage:
        Before first request:  GET idempotency:txn_... → (nil)
        During processing:     GET idempotency:txn_... → "processing"
        After completion:      GET idempotency:txn_... → '{"tx_hash": "0x9f8...", ...}'
        On retry:              GET idempotency:txn_... → cached result (no second transfer)
    """

    # Step 1: Check Redis — have we seen this key before?
    cached = r.get(f"idempotency:{idempotency_key}")

    if cached:
        # We already processed this — return the same response.
        # User probably double-clicked or retried after a timeout.
        return json.loads(cached)

    # Step 2: Lock the key so parallel retries don't slip through.
    # NX = only set if it doesn't exist (atomic).
    # EX = expire after 24 hours (don't keep forever).
    locked = r.set(f"idempotency:{idempotency_key}", "processing", nx=True, ex=86400)

    if not locked:
        # Another request with the same key is already in flight
        return {"status": "already processing, please wait"}

    # Step 3: Do the actual transfer (the dangerous, non-reversible part)
    result = await execute_blockchain_transfer(
        from_wallet=request.from_wallet,
        to_wallet=request.to_wallet,
        amount=request.amount,
    )

    # Step 4: Store the result under the same key
    r.set(f"idempotency:{idempotency_key}", json.dumps(result), ex=86400)

    return result
