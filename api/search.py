"""Semantic Search & RAG Knowledge Retrieval Endpoints."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from services.auth_service import require_auth
from services.rag_service import RagService

router = APIRouter()


class SemanticSearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=2,
        description="Search keyword, question, or natural language query",
    )
    entity_filter: str = Field(
        "all", description="'all', 'voice_call', 'meeting', 'email', 'deal_strategy'"
    )
    top_k: int = Field(5, ge=1, le=25, description="Number of results to return")
    min_score: float = Field(
        0.01, ge=0.0, le=1.0, description="Minimum similarity threshold"
    )


class RagAskRequest(BaseModel):
    question: str = Field(
        ..., min_length=3, description="Question to answer using CRM knowledge"
    )
    top_k: int = Field(4, ge=1, le=10)


@router.post("/semantic", response_model=List[Dict[str, Any]])
async def semantic_search(
    payload: SemanticSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Search sales transcripts, meeting briefings, customer emails, and strategy decks with vector embeddings."""
    results = RagService.semantic_search(
        query=payload.query,
        db=db,
        entity_filter=payload.entity_filter,
        top_k=payload.top_k,
        min_score=payload.min_score,
    )
    return results


@router.post("/rag-ask", response_model=Dict[str, Any])
async def rag_ask_question(
    payload: RagAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Answer natural language questions grounded in CRM knowledge with exact source citations."""
    response = await RagService.ask_crm_rag(
        question=payload.question,
        db=db,
        top_k=payload.top_k,
    )
    return response
