# 📈 Advanced Monte Carlo & ML Revenue Forecasting

The Forecasting module provides probabilistic revenue modeling through stochastic Monte Carlo simulations, ARR trend projections, and pipeline velocity hazard analysis.

---

## 🏗️ Architecture

```
Active Pipeline Deals (database/models.py: Deal)
                      ↓
          ForecastingService (services/forecasting_service.py)
                      ↓
    • Stochastic Monte Carlo Simulation (1,000–25,000 runs)
    • Stage Win Rates & Hazard Matrix
    • Slippage Risk Adjustments
    • P10 (Conservative), P50 (Expected), P90 (Optimistic)
                      ↓
          FastAPI Router (/api/forecasting)
                      ↓
          PostgreSQL (ForecastSimulation Model)
                      ↓
          React Frontend (frontend/src/features/forecasting/)
```

---

## 🗄️ Database Models

### `ForecastSimulation`
* `id` (UUID): Primary key.
* `name` (String): Scenario name (e.g., `Q3 Base Scenario`, `Optimistic Plan`).
* `num_simulations` (Integer): Number of simulation iterations (e.g. 1000).
* `time_horizon_days` (Integer): Prediction horizon (30, 60, 90, 180 days).
* `target_revenue` (Float): Revenue goal / quota.
* `p10_revenue` (Float): 10th percentile conservative estimate.
* `p50_revenue` (Float): 50th percentile median expected revenue.
* `p90_revenue` (Float): 90th percentile optimistic revenue.
* `mean_revenue` (Float): Average simulated revenue.
* `probability_target_met` (Float): Probability of exceeding `target_revenue`.
* `stage_probabilities` (JSON): Customized per-stage win rate overrides.
* `created_at` (DateTime): Simulation creation timestamp.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/forecasting/simulate` | Run Monte Carlo simulation with configurable parameters |
| `GET` | `/api/forecasting/simulations` | List saved simulation scenarios |
| `GET` | `/api/forecasting/simulations/{id}` | Get specific simulation details |
| `DELETE` | `/api/forecasting/simulations/{id}` | Delete a saved simulation |
| `GET` | `/api/forecasting/arr-trend` | Monthly ARR historical and projected trend vs target |
| `GET` | `/api/forecasting/stage-breakdown` | Pipeline revenue and deal volume breakdown per stage |

---

## 🎨 Frontend Features (`frontend/src/features/forecasting/`)

* **4-Tab Navigation**:
  1. **Monte Carlo Simulation**:
     - Configurable parameters: Iteration count (1K–25K), time horizon, target revenue.
     - Per-stage win probability sliders (Discovery, Qualified, Proposal, Negotiation).
     - Layered progress bar visualizer showing P10 / P50 / P90 vs quarterly targets.
     - Histogram distribution of simulated revenue outcomes.
  2. **ARR Trend Projection**:
     - Recharts LineChart comparing actual ARR vs projected growth trajectory.
     - Monthly delta cards showing gains/losses against target.
  3. **Pipeline Breakdown & Velocity**:
     - Color-coded stage revenue BarChart.
     - Deal velocity hazard matrix with average days in stage, conversion rates, and slippage risk.
  4. **Saved Scenarios Comparison**:
     - Executive comparison table listing all saved simulations.
     - Grouped bar chart comparing P10, P50, and P90 across multiple business scenarios.
     - Scenario deletion and quick-load actions.
