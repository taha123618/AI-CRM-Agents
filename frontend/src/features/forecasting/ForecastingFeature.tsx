import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { forecastingApi } from './api/forecastingApi';
import { ForecastSimulationRecord } from './types/forecasting.types';
import {
  TrendingUp,
  Sliders,
  Bookmark,
  Activity,
  RefreshCw,
  Trash2,
  Target,
  BarChart2,
  GitCompare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';

const STAGE_COLORS: Record<string, string> = {
  Discovery: '#6366f1',
  Qualified: '#3b82f6',
  Proposal: '#f59e0b',
  Negotiation: '#f97316',
  'Closed Won': '#10b981',
};

export function ForecastingFeature() {
  const queryClient = useQueryClient();

  const [iterations, setIterations] = useState<number>(1000);
  const [slippageRate, setSlippageRate] = useState<number>(0.15);
  const [activeTab, setActiveTab] = useState<'monte-carlo' | 'arr-trend' | 'pipeline' | 'scenarios'>('monte-carlo');
  const [customStageProbs, setCustomStageProbs] = useState<Record<string, number>>({
    lead: 0.15,
    qualified: 0.30,
    proposal: 0.60,
    negotiation: 0.80,
  });

  // Queries
  const {
    data: simulation,
    isLoading: isLoadingSim,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['monte-carlo', iterations, slippageRate, customStageProbs],
    queryFn: () =>
      forecastingApi.runMonteCarlo({
        iterations,
        deal_slippage_rate: slippageRate,
        custom_stage_probs: customStageProbs,
      }),
  });

  const { data: velocity } = useQuery({
    queryKey: ['pipeline-velocity'],
    queryFn: () => forecastingApi.getPipelineVelocity(),
  });

  const { data: arrTrend } = useQuery({
    queryKey: ['arr-trend'],
    queryFn: () => forecastingApi.getArrTrend(),
  });

  const { data: stageBreakdown } = useQuery({
    queryKey: ['stage-breakdown'],
    queryFn: () => forecastingApi.getStageBreakdown(),
  });

  const { data: savedSimulations } = useQuery({
    queryKey: ['saved-simulations'],
    queryFn: () => forecastingApi.getSavedSimulations(),
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!simulation) return;
      return forecastingApi.saveSimulation({
        name: `Monte Carlo — ${iterations.toLocaleString()} Runs (Slippage: ${(slippageRate * 100).toFixed(0)}%)`,
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
      queryClient.invalidateQueries({ queryKey: ['saved-simulations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => forecastingApi.deleteSimulation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-simulations'] });
    },
  });

  const chartData = (simulation?.distribution_curve || []).map((b) => ({
    name: b.range_label,
    frequency: b.probability_frequency,
    percentage: `${b.percentage}%`,
  }));

  const tabs = [
    { key: 'monte-carlo', label: 'Monte Carlo', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'arr-trend', label: 'ARR Trend', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'pipeline', label: 'Pipeline Breakdown', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'scenarios', label: 'Saved Scenarios', icon: <GitCompare className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span>Advanced Monte Carlo & ML Revenue Forecasting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Probabilistic ARR simulation, pipeline velocity hazard rates, stage breakdown, and confidence intervals.
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
            <span>Save Scenario</span>
          </Button>
        </div>
      </div>

      {/* ── P10/P50/P90 KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pipeline Evaluated
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ${((simulation?.pipeline_total_value || 0) / 1000).toFixed(0)}k
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {simulation?.deals_evaluated || 0} active opportunities
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
            <span>P50 Expected</span>
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

      {/* ── Q3 Target Progress Bar ── */}
      {simulation && (
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Q3 2026 Target Progress
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">
                Expected: <span className="text-amber-400 font-bold">${(simulation.p50_expected / 1000).toFixed(0)}k</span>
              </span>
              <span className="text-slate-400">
                Ceiling: <span className="text-emerald-400 font-bold">${(simulation.p90_optimistic / 1000).toFixed(0)}k</span>
              </span>
            </div>
          </div>
          <div className="relative h-4 rounded-full bg-slate-800 overflow-hidden">
            {/* P10 band */}
            <div
              className="absolute top-0 left-0 h-full bg-cyan-500/30 rounded-full"
              style={{
                width: `${Math.min(
                  (simulation.p10_conservative / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
            {/* P50 band */}
            <div
              className="absolute top-0 left-0 h-full bg-amber-500/50 rounded-full"
              style={{
                width: `${Math.min(
                  (simulation.p50_expected / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
            {/* P90 band */}
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500/40 rounded-full"
              style={{
                width: `${Math.min(
                  (simulation.p90_optimistic / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
            <span>$0</span>
            <span>${(simulation.pipeline_total_value / 1000).toFixed(0)}k pipeline</span>
          </div>
        </Card>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MONTE CARLO ── */}
      {activeTab === 'monte-carlo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Simulation Controls
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{iterations.toLocaleString()} Iterations</span>
            </div>

            {/* Iterations selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
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

            {/* Slippage slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Deal Slippage Hazard</span>
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
                Simulates macro procurement delays.
              </span>
            </div>

            {/* Per-stage probability editor */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Custom Stage Win Probabilities
              </span>
              {Object.entries(customStageProbs).map(([stage, prob]) => (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 w-24 capitalize font-mono">{stage}</span>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={prob}
                    onChange={(e) =>
                      setCustomStageProbs((prev) => ({
                        ...prev,
                        [stage]: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1 accent-amber-500 h-1"
                  />
                  <span className="text-[10px] font-mono text-amber-400 w-8 text-right">
                    {(prob * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribution Chart */}
          <Card className="lg:col-span-2 p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Probability Frequency Density
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distribution across {iterations.toLocaleString()} stochastic revenue runs.
                </p>
              </div>
              <Badge variant="default" className="text-[10px] font-mono">
                {simulation?.target_quarter || 'Q3 2026'}
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
      )}

      {/* ── TAB: ARR TREND ── */}
      {activeTab === 'arr-trend' && (
        <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Monthly ARR Trend vs Target
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Actual ARR progression compared to quarterly target trajectory.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={arrTrend || []}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                  formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="arr"
                  name="Actual ARR"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Delta badges */}
          {arrTrend && (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {arrTrend.map((point) => (
                <div
                  key={point.month}
                  className={`p-2 rounded-xl text-center border ${
                    point.delta_pct >= 0
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 font-mono">{point.month}</div>
                  <div
                    className={`text-xs font-bold font-mono ${
                      point.delta_pct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {point.delta_pct >= 0 ? '+' : ''}{point.delta_pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── TAB: PIPELINE BREAKDOWN ── */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Bar Chart */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Revenue by Pipeline Stage
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Current pipeline value distribution</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stageBreakdown || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                    formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(stageBreakdown || []).map((entry) => (
                      <Cell
                        key={entry.stage}
                        fill={STAGE_COLORS[entry.stage] || '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stage Table */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Stage Breakdown Detail
            </h3>
            <div className="space-y-2.5">
              {(stageBreakdown || []).map((s) => {
                const total = (stageBreakdown || []).reduce((acc, x) => acc + x.value, 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const color = STAGE_COLORS[s.stage] || '#6366f1';
                return (
                  <div key={s.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{s.stage}</span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-slate-400">{s.deals} deals</span>
                        <span className="font-bold text-white">
                          ${(s.value / 1000).toFixed(0)}k
                        </span>
                        <span className="text-slate-500">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Velocity summary */}
            {velocity && (
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                {[
                  { label: 'Win Rate', value: `${velocity.win_rate_percentage}%`, color: 'text-emerald-400' },
                  { label: 'Avg Cycle', value: `${velocity.avg_sales_cycle_days}d`, color: 'text-amber-400' },
                  { label: 'Monthly Velocity', value: `$${(velocity.monthly_velocity_arr / 1000).toFixed(0)}k`, color: 'text-purple-400' },
                  { label: 'Total Pipeline', value: `$${((simulation?.pipeline_total_value || 0) / 1000).toFixed(0)}k`, color: 'text-white' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{item.label}</span>
                    <span className={`text-base font-black font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage Velocity Table */}
          <Card className="lg:col-span-2 p-5 bg-slate-900/70 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Pipeline Stage Velocity & Conversion Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Avg Days</th>
                    <th className="py-2.5 px-3">Conversion Rate</th>
                    <th className="py-2.5 px-3">Slippage Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
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
      )}

      {/* ── TAB: SAVED SCENARIOS ── */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Forecast Scenarios ({savedSimulations?.length || 0})
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
              className="bg-amber-600 hover:bg-amber-500"
            >
              <Bookmark className="w-3.5 h-3.5 mr-1.5" />
              Save Current Scenario
            </Button>
          </div>

          {!savedSimulations?.length ? (
            <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
              No saved scenarios yet. Run a simulation and save it to compare scenarios here.
            </div>
          ) : (
            <>
              {/* Comparison Table */}
              <Card className="p-5 bg-slate-900/70 border-slate-800/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Scenario Name</th>
                        <th className="py-2.5 px-3">Quarter</th>
                        <th className="py-2.5 px-3">P10 (Conservative)</th>
                        <th className="py-2.5 px-3">P50 (Expected)</th>
                        <th className="py-2.5 px-3">P90 (Optimistic)</th>
                        <th className="py-2.5 px-3">Slippage</th>
                        <th className="py-2.5 px-3">Saved</th>
                        <th className="py-2.5 px-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(savedSimulations || []).map((s: ForecastSimulationRecord) => (
                        <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-3 text-white font-semibold max-w-[200px] truncate">
                            {s.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{s.target_quarter}</td>
                          <td className="py-3 px-3 font-mono text-cyan-400">
                            ${(s.p10_conservative / 1000).toFixed(1)}k
                          </td>
                          <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                            ${(s.p50_expected / 1000).toFixed(1)}k
                          </td>
                          <td className="py-3 px-3 font-mono text-emerald-400">
                            ${(s.p90_optimistic / 1000).toFixed(1)}k
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">
                            {(s.deal_slippage_rate * 100).toFixed(0)}%
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => deleteMutation.mutate(s.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Scenario Comparison Bar Chart */}
              {savedSimulations.length >= 2 && (
                <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Scenario P50 Comparison
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Side-by-side P50 expected ARR across all saved scenarios
                    </p>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={savedSimulations.map((s) => ({
                          name:
                            s.name.length > 22 ? s.name.slice(0, 22) + '…' : s.name,
                          p50: s.p50_expected,
                          p10: s.p10_conservative,
                          p90: s.p90_optimistic,
                        }))}
                        margin={{ top: 10, right: 10, left: -10, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={9}
                          tickLine={false}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            fontSize: '11px',
                          }}
                          formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        <Bar dataKey="p10" name="P10 Conservative" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="p50" name="P50 Expected" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="p90" name="P90 Optimistic" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
