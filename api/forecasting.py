"""FastAPI Router for Advanced Revenue Forecasting & Monte Carlo Simulation."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from database.connection import get_db
from database.models import ForecastSimulation
from services.forecasting_service import ForecastingService

router = APIRouter()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class MonteCarloRunSchema(BaseModel):
    iterations: int = Field(
        1000, ge=100, le=10000, description="Monte Carlo simulation iterations"
    )
    deal_slippage_rate: float = Field(
        0.15, ge=0.0, le=0.8, description="Expected slippage discount rate"
    )
    custom_stage_probs: Optional[Dict[str, float]] = Field(
        None, description="Custom win probabilities"
    )


class SaveSimulationSchema(BaseModel):
    name: str = Field(..., min_length=2)
    target_quarter: str = Field("Q3 2026")
    pipeline_total_value: float = Field(..., ge=0.0)
    iterations: int = Field(1000)
    p10_conservative: float = Field(..., ge=0.0)
    p50_expected: float = Field(..., ge=0.0)
    p90_optimistic: float = Field(..., ge=0.0)
    deal_slippage_rate: float = Field(0.15)
    stage_probabilities: Dict[str, float] = Field(default_factory=dict)
    distribution_curve: List[Dict[str, Any]] = Field(default_factory=list)


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.post("/monte-carlo", response_model=Dict[str, Any])
def run_monte_carlo(
    payload: MonteCarloRunSchema,
    db: Session = Depends(get_db),
):
    """Run Monte Carlo simulation across all pipeline deals with customizable confidence bounds."""
    res = ForecastingService.run_monte_carlo_simulation(
        db=db,
        iterations=payload.iterations,
        deal_slippage_rate=payload.deal_slippage_rate,
        custom_stage_probs=payload.custom_stage_probs,
    )
    return res


@router.get("/pipeline-velocity", response_model=Dict[str, Any])
def get_pipeline_velocity(db: Session = Depends(get_db)):
    """Compute pipeline velocity, stage duration averages, and conversion hazard rates."""
    return ForecastingService.get_pipeline_velocity_matrix(db)


@router.get("/arr-trend", response_model=List[Dict[str, Any]])
def get_arr_trend(db: Session = Depends(get_db)):
    """Return monthly ARR trend data for the current fiscal year."""
    return ForecastingService.get_arr_trend(db)


@router.get("/stage-breakdown", response_model=List[Dict[str, Any]])
def get_stage_breakdown(db: Session = Depends(get_db)):
    """Return current pipeline revenue value breakdown per stage."""
    return ForecastingService.get_stage_revenue_breakdown(db)


@router.post("/simulations", response_model=Dict[str, Any], status_code=201)
def save_simulation(
    payload: SaveSimulationSchema,
    db: Session = Depends(get_db),
):
    """Save simulation forecast scenario for executive board review."""
    sim = ForecastingService.save_simulation(db, payload.model_dump())
    return {
        "status": "success",
        "simulation_id": str(sim.id),
        "name": sim.name,
        "p50_expected": sim.p50_expected,
    }


@router.get("/simulations", response_model=List[Dict[str, Any]])
def list_saved_simulations(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Retrieve saved simulation scenario history."""
    sims = (
        db.query(ForecastSimulation)
        .order_by(ForecastSimulation.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "target_quarter": s.target_quarter,
            "pipeline_total_value": s.pipeline_total_value,
            "p10_conservative": s.p10_conservative,
            "p50_expected": s.p50_expected,
            "p90_optimistic": s.p90_optimistic,
            "deal_slippage_rate": s.deal_slippage_rate,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in sims
    ]


@router.delete("/simulations/{simulation_id}", response_model=Dict[str, Any])
def delete_simulation(
    simulation_id: str,
    db: Session = Depends(get_db),
):
    """Delete a saved forecast simulation scenario."""
    deleted = ForecastingService.delete_simulation(db, simulation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Simulation not found.")
    return {"status": "deleted", "simulation_id": simulation_id}
