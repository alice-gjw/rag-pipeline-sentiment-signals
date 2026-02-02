import gradio as gr
from backend.agent.rag_sentiment_scoring import score_event


def predict(event_description: str) -> tuple[str, str, str, str]:
    """Process user query and return formatted results."""
    if not event_description.strip():
        return "", "", "", ""

    result = score_event(event_description)

    prediction = result.get("prediction", 0)
    prediction_display = f"{prediction * 100:+.1f}%"

    confidence = result.get("confidence", 0)
    confidence_display = f"{confidence * 100:.0f}%"

    reasoning = result.get("reasoning", "No reasoning provided")

    sources = result.get("sources", [])
    sources_display = ""
    for s in sources:
        outcome = s.get("outcome", "unknown")
        p_created = s.get("price_at_created")
        p_start = s.get("price_at_start")
        p_end = s.get("price_at_end")

        created_str = f"${p_created:.2f}" if p_created else "N/A"
        start_str = f"${p_start:.2f}" if p_start else "N/A"
        end_str = f"${p_end:.2f}" if p_end else "N/A"

        url = s.get("url", "")
        sources_display += f"**[{s['proposal']}]({url})**\n\n"
        sources_display += f"Outcome: {outcome}\n\n"
        sources_display += f"Price: {created_str} (created) -> {start_str} (vote start) -> {end_str} (vote end)\n\n---\n\n"

    return prediction_display, confidence_display, reasoning, sources_display


with gr.Blocks(title="Governance Sentiment Analyzer") as app:
    gr.Markdown("# Governance Sentiment Analyzer")
    gr.Markdown("Predict how a governance event will affect token price based on historical proposals.")

    with gr.Row():
        with gr.Column():
            query_input = gr.Textbox(
                label="Describe the governance event",
                placeholder="e.g., Proposal to reduce staking rewards by 50%",
                lines=3
            )
            submit_btn = gr.Button("Analyze", variant="primary")

            gr.Examples(
                examples=[
                    ["Proposal to reduce staking rewards by 50%"],
                    ["Treasury diversification into stablecoins"],
                    ["Increase liquidity mining incentives"],
                    ["Enable protocol fee switch"],
                    ["Grant funding for ecosystem development"],
                    ["Change voting quorum requirements"],
                ],
                inputs=query_input,
                label="Try these examples"
            )

        with gr.Column():
            prediction_output = gr.Textbox(label="Predicted Price Impact", interactive=False)
            confidence_output = gr.Textbox(label="Confidence", interactive=False)

    reasoning_output = gr.Textbox(label="Reasoning", interactive=False)
    gr.Markdown("### Similar Historical Proposals")
    sources_output = gr.Markdown()

    submit_btn.click(
        fn=predict,
        inputs=[query_input],
        outputs=[prediction_output, confidence_output, reasoning_output, sources_output]
    )

    query_input.submit(
        fn=predict,
        inputs=[query_input],
        outputs=[prediction_output, confidence_output, reasoning_output, sources_output]
    )


if __name__ == "__main__":
    app.launch()
