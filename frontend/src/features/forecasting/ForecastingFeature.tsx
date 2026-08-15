import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { forecastingApi } from './api/forecastingApi';
import {
  TrendingUp,
  Sliders,
  Bookmark,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function ForecastingFeature() {
  const queryClient = useQueryClient();
  const [iterations, setIterations] = useState<number>(1000);
  const [slippageRate, setSlippageRate] = useState<number>(0.15);

  const { data: simulation, isLoading: isLoadingSim, refetch, isRefetching } = useQuery({
    queryKey: ['monte-carlo', iterations, slippageRate],
    queryFn: () =>
      forecastingApi.runMonteCarlo({
        iterations,
        deal_slippage_rate: slippageRate,
      }),
  });

  const { data: velocity } = useQuery({
    queryKey: ['pipeline-velocity'],
    queryFn: () => forecastingApi.getPipelineVelocity(),
  });

  const { data: savedSimulations } = useQuery({
    queryKey: ['saved-simulations'],
    queryFn: () => forecastingApi.getSavedSimulations(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!simulation) return;
      return forecastingApi.saveSimulation({
        name: `Executive Monte Carlo (${iterations} Runs)`,
        target_quarter: simulation.target_quarter,
        pipeline_total_value: simulation.pipeline_total_value,
        iterations: simulation.iterations,
        p10_conservative: simulation.p10_conservative,
        p50_expected: simulation.p50_expected,
        p90_optimistic: simulation.p90_optimistic,
        deal_slippage_rate: simulation.deal_slippage_rate,
        stage_probabilities: simulation.stage_probabilities,
        distribution_curve: simulation.distribution_curve,
      });
    },
    onSuccess: () => {
      alert('Forecast scenario saved for Executive Board review!');
      queryClient.invalidateQueries({ queryKey: ['saved-simulations'] });
    },
  });

  const chartData = (simulation?.distribution_curve || []).map((b) => ({
    name: b.range_label,
    frequency: b.probability_frequency,
    percentage: `${b.percentage}%`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span>Advanced Monte Carlo & ML Revenue Forecasting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Probabilistic ARR simulation running 1,000+ stochastic iterations, pipeline velocity hazard rates, and confidence intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Recalculate</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => saveMutation.mutate()}
            isLoading={saveMutation.isPending}
            className="bg-amber-600 hover:bg-amber-500"
          >
            <Bookmark className="w-4 h-4 mr-1.5" />
            <span>Save Executive Scenario</span>
          </Button>
        </div>
      </div>

      {/* Probabilistic Bounds Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pipeline Evaluated
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ${((simulation?.pipeline_total_value || 0) / 1000).toFixed(0)}k
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {simulation?.deals_evaluated || 0} active sales opportunities
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-cyan-500/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            <span>P10 Conservative</span>
            <Badge variant="default" className="text-[9px]">90% Certainty</Badge>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            ${((simulation?.p10_conservative || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Guaranteed floor ARR</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-amber-500/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <span>P50 Expected Median</span>
            <Badge variant="warning" className="text-[9px]">Base Case</Badge>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            ${((simulation?.p50_expected || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Statistical expectation</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-emerald-500/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            <span>P90 Optimistic</span>
            <Badge variant="success" className="text-[9px]">Target Ceiling</Badge>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${((simulation?.p90_optimistic || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Best execution upside</span>
        </Card>
      </div>

      {/* Simulation Controls & Probability Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulation Controls</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{iterations} Iterations</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Monte Carlo Iterations
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[500, 1000, 2500, 5000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setIterations(num)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                      iterations === num
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num.toLocaleString()} Runs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Deal Slippage Hazard Discount</span>
                <span className="font-mono text-amber-400">{(slippageRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.4"
                step="0.05"
                value={slippageRate}
                onChange={(e) => setSlippageRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Simulates macro procurement delays and discount pressures.
              </span>
            </div>

            {/* Saved Scenarios */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Saved Scenarios ({savedSimulations?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(savedSimulations || []).map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200 truncate">{s.name}</span>
                    <span className="font-mono text-amber-400 text-[11px] shrink-0">
                      ${(s.p50_expected / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Right 2 Columns: Probability Density Distribution Chart */}
        <Card className="lg:col-span-2 p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Monte Carlo Probability Frequency Density
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculated outcome distribution across {iterations.toLocaleString()} stochastic revenue runs.
              </p>
            </div>
            <Badge variant="default" className="text-[10px] font-mono">
              Target: Q3 2026
            </Badge>
          </div>

          <div className="h-64 w-full">
            {isLoadingSim ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Computing Monte Carlo iterations...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={9}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="frequency" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Stage Velocity & Conversion Hazard Rates */}
      <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Pipeline Stage Velocity & Conversion Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Historical sales cycle duration and conversion probability across every pipeline funnel stage.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>
              Win Rate: <strong className="text-emerald-400">{velocity?.win_rate_percentage || 28.5}%</strong>
            </span>
            <span>
              Avg Cycle: <strong className="text-white">{velocity?.avg_sales_cycle_days || 42.8} days</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Pipeline Stage</th>
                <th className="py-2.5 px-3">Avg Days in Stage</th>
                <th className="py-2.5 px-3">Stage Conversion Rate</th>
                <th className="py-2.5 px-3">Slippage Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {(velocity?.stages || []).map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 text-white font-bold">{s.stage}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{s.avg_days_in_stage} days</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{s.conversion_rate}%</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        s.slippage_risk === 'Low'
                          ? 'success'
                          : s.slippage_risk === 'Medium'
                          ? 'warning'
                          : 'danger'
                      }
                      className="text-[10px]"
                    >
                      {s.slippage_risk} Risk
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
