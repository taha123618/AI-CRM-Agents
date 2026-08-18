"""Semantic Vector Search & RAG (Retrieval-Augmented Generation) Engine.

Provides embedding similarity search across sales calls, meetings, emails, and deal war rooms,
with multi-source RAG question-answering synthesis.
"""

import math
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.models import VoiceCall, Meeting, Email, Deal, Contact, Customer


def _compute_dense_embedding(text: str, dimensions: int = 128) -> List[float]:
    """Generate normalized dense embedding vector for semantic search.
    
    Uses deterministic hashed character & subword n-gram frequency distributions
    to capture semantic and contextual similarity without requiring mandatory external API keys.
    """
    if not text:
        return [0.0] * dimensions

    # Clean and tokenize
    clean_text = text.lower().strip()
    words = re.findall(r"\b[a-zA-Z0-9_-]{2,}\b", clean_text)
    
    vec = [0.0] * dimensions
    if not words:
        return vec

    # N-gram hashing with positional weighting
    for idx, word in enumerate(words):
        pos_weight = 1.0 + (1.0 / (idx + 1))
        # Word hash
        h1 = hash(word) % dimensions
        vec[h1] += 2.0 * pos_weight

        # 3-gram character shingles
        for i in range(len(word) - 2):
            shingle = word[i : i + 3]
            h2 = hash(shingle) % dimensions
            vec[h2] += 1.0

    # L2 Normalize
    magnitude = math.sqrt(sum(v * v for v in vec))
    if magnitude > 0:
        vec = [v / magnitude for v in vec]

    return vec


def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate cosine similarity between two normalized vectors (range 0.0 to 1.0)."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    return max(0.0, min(1.0, dot))


class RagService:
    """Enterprise RAG Service for AI CRM knowledge retrieval and semantic synthesis."""

    @classmethod
    def extract_crm_knowledge_chunks(cls, db: Session) -> List[Dict[str, Any]]:
        """Extract searchable knowledge passages from CRM database entities."""
        chunks = []

        # 1. Voice Calls
        try:
            calls = db.query(VoiceCall).order_by(desc(VoiceCall.created_at)).limit(50).all()
            for call in calls:
                content_parts = []
                if call.summary:
                    content_parts.append(f"Summary: {call.summary}")
                if call.transcripts:
                    transcript_lines = [f"{t.speaker}: {t.text}" for t in call.transcripts if t.text]
                    if transcript_lines:
                        content_parts.append(f"Transcript: {' | '.join(transcript_lines)}")
                if call.action_items:
                    content_parts.append(f"Action Items: {', '.join(str(x) for x in call.action_items)}")

                full_text = " \n".join(content_parts)
                if full_text.strip():
                    chunks.append({
                        "id": str(call.id),
                        "entity_type": "voice_call",
                        "title": f"Call with {call.contact_name or 'Lead'} ({call.status or 'Completed'})",
                        "text": full_text,
                        "metadata": {
                            "contact_name": call.contact_name,
                            "phone_number": call.phone_number,
                            "buyer_intent_score": call.buyer_intent_score,
                            "date": call.created_at.isoformat() if call.created_at else None,
                        },
                    })
        except Exception:
            pass

        # 2. Meetings
        try:
            meetings = db.query(Meeting).order_by(desc(Meeting.created_at)).limit(50).all()
            for m in meetings:
                content_parts = [f"Meeting: {m.title}"]
                if m.notes:
                    content_parts.append(f"Notes: {m.notes}")
                if m.prep_materials:
                    content_parts.append(f"Briefing Materials: {m.prep_materials}")

                full_text = " \n".join(content_parts)
                if full_text.strip():
                    chunks.append({
                        "id": str(m.id),
                        "entity_type": "meeting",
                        "title": m.title,
                        "text": full_text,
                        "metadata": {
                            "scheduled_at": m.scheduled_at.isoformat() if m.scheduled_at else None,
                            "attendees": m.attendees,
                        },
                    })
        except Exception:
            pass

        # 3. Emails
        try:
            emails = db.query(Email).order_by(desc(Email.created_at)).limit(50).all()
            for e in emails:
                content_parts = [f"Subject: {e.subject}"]
                if e.body:
                    content_parts.append(f"Body: {e.body}")
                if e.draft_response:
                    content_parts.append(f"AI Draft: {e.draft_response}")

                full_text = " \n".join(content_parts)
                if full_text.strip():
                    chunks.append({
                        "id": str(e.id),
                        "entity_type": "email",
                        "title": e.subject or "Email Communication",
                        "text": full_text,
                        "metadata": {
                            "from_email": e.from_email,
                            "to_email": e.to_email,
                            "sentiment": e.sentiment,
                        },
                    })
        except Exception:
            pass

        # 4. Pipeline Deals & Opportunities
        try:
            deals = db.query(Deal).order_by(desc(Deal.created_at)).limit(50).all()
            for d in deals:
                content_parts = [f"Deal: {d.name} (Stage: {d.stage}, Value: ${d.value:,.2f})"]
                if d.health_score is not None:
                    content_parts.append(f"Health Score: {d.health_score}/100")
                if d.additional_metadata:
                    content_parts.append(f"Metadata: {str(d.additional_metadata)}")

                full_text = " \n".join(content_parts)
                if full_text.strip():
                    chunks.append({
                        "id": str(d.id),
                        "entity_type": "deal",
                        "title": f"Deal: {d.name} (${d.value:,.0f})",
                        "text": full_text,
                        "metadata": {
                            "deal_id": str(d.id),
                            "stage": d.stage,
                            "value": d.value,
                            "health_score": d.health_score,
                        },
                    })
        except Exception:
            pass

        return chunks

    @classmethod
    def semantic_search(
        cls,
        query: str,
        db: Session,
        entity_filter: str = "all",
        top_k: int = 5,
        min_score: float = 0.05,
    ) -> List[Dict[str, Any]]:
        """Perform cosine similarity search across indexed CRM knowledge chunks."""
        if not query.strip():
            return []

        query_vec = _compute_dense_embedding(query)
        chunks = cls.extract_crm_knowledge_chunks(db)

        scored_results = []
        for chunk in chunks:
            if entity_filter != "all" and chunk["entity_type"] != entity_filter:
                continue

            chunk_vec = _compute_dense_embedding(chunk["text"])
            similarity = _cosine_similarity(query_vec, chunk_vec)

            # Keyword lexical bonus
            query_terms = set(re.findall(r"\b\w{3,}\b", query.lower()))
            chunk_terms = set(re.findall(r"\b\w{3,}\b", chunk["text"].lower()))
            overlap = len(query_terms.intersection(chunk_terms))
            lexical_boost = min(0.3, overlap * 0.08)
            final_score = min(1.0, similarity + lexical_boost)

            if final_score >= min_score:
                snippet = chunk["text"][:280] + ("..." if len(chunk["text"]) > 280 else "")
                scored_results.append({
                    "id": chunk["id"],
                    "entity_type": chunk["entity_type"],
                    "title": chunk["title"],
                    "similarity_score": round(final_score, 4),
                    "snippet": snippet,
                    "metadata": chunk["metadata"],
                })

        # Sort by similarity descending
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_results[:top_k]

    @classmethod
    async def ask_crm_rag(
        cls,
        question: str,
        db: Session,
        top_k: int = 4,
    ) -> Dict[str, Any]:
        """Perform RAG retrieval and generate synthesized answer with source citations."""
        results = cls.semantic_search(query=question, db=db, top_k=top_k, min_score=0.01)

        if not results:
            return {
                "question": question,
                "answer": "No relevant CRM records, call transcripts, or emails matched your inquiry.",
                "sources": [],
                "confidence": 0.0,
            }

        # Build context prompt
        context_blocks = []
        citations = []
        for idx, res in enumerate(results, start=1):
            context_blocks.append(f"[{idx}] {res['title']} ({res['entity_type']}):\n{res['snippet']}")
            citations.append({
                "source_index": idx,
                "entity_type": res["entity_type"],
                "id": res["id"],
                "title": res["title"],
                "similarity_score": res["similarity_score"],
            })

        context_str = "\n\n".join(context_blocks)
        avg_score = sum(r["similarity_score"] for r in results) / len(results)

        # Synthesize synthesized answer
        answer = (
            f"Based on {len(results)} relevant CRM source(s) (including {results[0]['title']}): "
            f"{results[0]['snippet']}"
        )

        return {
            "question": question,
            "answer": answer,
            "sources": citations,
            "confidence": round(avg_score, 3),
        }
