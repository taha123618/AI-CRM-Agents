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
  Discovery: '#00E5FF',
  Qualified: '#39FF14',
  Proposal: '#FFB800',
  Negotiation: '#FF7700',
  'Closed Won': '#39FF14',
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
    pct: b.percentage,
  }));

  const tabs = [
    { key: 'monte-carlo' as const, label: 'MONTE CARLO SIMULATION', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'arr-trend' as const, label: 'ARR PROGRESSION TREND', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'pipeline' as const, label: 'STAGE HAZARD & VELOCITY', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'scenarios' as const, label: `SAVED RUNS (${savedSimulations?.length || 0})`, icon: <GitCompare className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1F2833] p-4 border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#39FF14]" />
              <span>REVENUE FORECASTING &amp; MONTE CARLO SIMULATION</span>
            </h1>
            <Badge variant="purple" className="text-[8px] font-mono">
              STOCHASTIC ENGINE
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 uppercase">
            STOCHASTIC PROBABILITY DISTRIBUTIONS, ARR PREDICTIVE TRAJECTORIES, AND HAZARD CONVERSIONS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs h-7"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 text-[#39FF14] ${isRefetching ? 'animate-spin' : ''}`} />
            <span>RE-RUN</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !simulation}
            className="text-xs h-7"
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" />
            <span>SAVE SCENARIO</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>PIPELINE TOTAL</span>
            <Badge variant="purple" className="text-[8px]">ACTIVE</Badge>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ${((simulation?.pipeline_total_value || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block uppercase">SUM OF OPEN DEAL VALUE</span>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            <span>P10 CONSERVATIVE</span>
            <Badge variant="purple" className="text-[8px]">FLOOR</Badge>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            ${((simulation?.p10_conservative || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5 block uppercase">90% PROBABILITY FLOOR</span>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#FFB800] uppercase tracking-wider">
            <span>P50 EXPECTED</span>
            <Badge variant="warning" className="text-[8px]">BASE CASE</Badge>
          </div>
          <div className="text-2xl font-black text-[#FFB800] font-mono mt-1">
            ${((simulation?.p50_expected || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5 block uppercase">STATISTICAL EXPECTATION</span>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#39FF14]">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#39FF14] uppercase tracking-wider">
            <span>P90 OPTIMISTIC</span>
            <Badge variant="success" className="text-[8px]">CEILING</Badge>
          </div>
          <div className="text-2xl font-black text-[#39FF14] font-mono mt-1">
            ${((simulation?.p90_optimistic || 0) / 1000).toFixed(1)}k
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5 block uppercase">BEST EXECUTION UPSIDE</span>
        </Card>
      </div>

      {/* ── Q3 Target Progress Bar ── */}
      {simulation && (
        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                TARGET REVENUE HORIZON PROGRESS
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">
                EXPECTED: <span className="text-[#FFB800] font-bold">${(simulation.p50_expected / 1000).toFixed(0)}k</span>
              </span>
              <span className="text-slate-400 uppercase text-[10px]">
                CEILING: <span className="text-[#39FF14] font-bold">${(simulation.p90_optimistic / 1000).toFixed(0)}k</span>
              </span>
            </div>
          </div>
          <div className="relative h-3 bg-[#0B0C10] border border-[#3A4552] overflow-hidden">
            {/* P10 band */}
            <div
              className="absolute top-0 left-0 h-full bg-cyan-500/40"
              style={{
                width: `${Math.min(
                  (simulation.p10_conservative / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
            {/* P50 band */}
            <div
              className="absolute top-0 left-0 h-full bg-[#FFB800]/50"
              style={{
                width: `${Math.min(
                  (simulation.p50_expected / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
            {/* P90 band */}
            <div
              className="absolute top-0 left-0 h-full bg-[#39FF14]/60"
              style={{
                width: `${Math.min(
                  (simulation.p90_optimistic / simulation.pipeline_total_value) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 font-mono uppercase">
            <span>$0</span>
            <span>${(simulation.pipeline_total_value / 1000).toFixed(0)}k TOTAL PIPELINE</span>
          </div>
        </Card>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-[#3A4552] bg-[#0B0C10] px-2 font-mono">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 -mb-px transition-none ${
              activeTab === tab.key
                ? 'border-[#39FF14] text-[#39FF14]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MONTE CARLO ── */}
      {activeTab === 'monte-carlo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Controls */}
          <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#39FF14]" />
                SIMULATION CONTROLS
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">{iterations.toLocaleString()} RUNS</span>
            </div>

            {/* Iterations selector */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1.5">
                MONTE CARLO ITERATIONS
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[500, 1000, 2500, 5000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setIterations(num)}
                    className={`py-1 text-xs font-mono uppercase border transition-none ${
                      iterations === num
                        ? 'bg-[#39FF14] text-[#0B0C10] border-[#39FF14] font-bold'
                        : 'bg-[#0B0C10] text-slate-400 border-[#3A4552] hover:text-white'
                    }`}
                  >
                    {num.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Slippage slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase mb-1">
                <span>DEAL SLIPPAGE HAZARD</span>
                <span className="font-mono text-[#FFB800]">{(slippageRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.4"
                step="0.05"
                value={slippageRate}
                onChange={(e) => setSlippageRate(parseFloat(e.target.value))}
                className="w-full accent-[#39FF14]"
              />
              <span className="text-[9px] text-slate-500 mt-0.5 block uppercase font-mono">
                SIMULATES MACRO PROCUREMENT DELAYS.
              </span>
            </div>

            {/* Per-stage probability editor */}
            <div className="border-t border-[#3A4552] pt-2.5 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                STAGE WIN PROBABILITIES
              </span>
              {Object.entries(customStageProbs).map(([stage, prob]) => (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-24 uppercase font-mono">{stage}</span>
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
                    className="flex-1 accent-[#39FF14] h-1"
                  />
                  <span className="text-[10px] font-mono text-[#39FF14] w-8 text-right font-bold">
                    {(prob * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribution Chart */}
          <Card className="lg:col-span-2 p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  PROBABILITY FREQUENCY DENSITY
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                  DISTRIBUTION ACROSS {iterations.toLocaleString()} STOCHASTIC REVENUE RUNS.
                </p>
              </div>
              <Badge variant="default" className="text-[9px] font-mono">
                {simulation?.target_quarter || 'Q3 2026'}
              </Badge>
            </div>

            <div className="h-64 w-full">
              {isLoadingSim ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase font-mono">
                  COMPUTING MONTE CARLO ITERATIONS...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A4552" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={9}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      fontFamily="monospace"
                    />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} fontFamily="monospace" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B0C10',
                        borderColor: '#3A4552',
                        borderRadius: '0px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#F1F5F9',
                      }}
                    />
                    <Bar dataKey="frequency" fill="#39FF14" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: ARR TREND ── */}
      {activeTab === 'arr-trend' && (
        <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
          <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                MONTHLY ARR TREND VS TARGET
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                ACTUAL ARR PROGRESSION COMPARED TO QUARTERLY TARGET TRAJECTORY.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arrTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A4552" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} fontFamily="monospace" />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0C10',
                    borderColor: '#3A4552',
                    borderRadius: '0px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#F1F5F9',
                  }}
                  formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }} />
                <Line
                  type="monotone"
                  dataKey="actual_arr"
                  name="Actual ARR"
                  stroke="#39FF14"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#39FF14' }}
                />
                <Line
                  type="monotone"
                  dataKey="target_arr"
                  name="Target ARR"
                  stroke="#00E5FF"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast_arr"
                  name="Forecast Trajectory"
                  stroke="#FFB800"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Month-over-month deltas */}
          {arrTrend && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-[#3A4552]">
              {arrTrend.map((point) => (
                <div
                  key={point.month}
                  className={`p-2 bg-[#0B0C10] text-center border ${
                    point.delta_pct >= 0
                      ? 'border-[#39FF14]/40'
                      : 'border-[#FF2A54]/40'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 font-mono uppercase">{point.month}</div>
                  <div
                    className={`text-xs font-bold font-mono ${
                      point.delta_pct >= 0 ? 'text-[#39FF14]' : 'text-[#FF2A54]'
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Stage Bar Chart */}
          <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                REVENUE BY PIPELINE STAGE
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">CURRENT PIPELINE VALUE DISTRIBUTION</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stageBreakdown || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3A4552" />
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={9} tickLine={false} fontFamily="monospace" />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={9}
                    tickLine={false}
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0C10',
                      borderColor: '#3A4552',
                      borderRadius: '0px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#F1F5F9',
                    }}
                    formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                  />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {(stageBreakdown || []).map((entry) => (
                      <Cell
                        key={entry.stage}
                        fill={STAGE_COLORS[entry.stage] || '#39FF14'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stage Table */}
          <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              STAGE BREAKDOWN DETAIL
            </h3>
            <div className="space-y-2">
              {(stageBreakdown || []).map((s) => {
                const total = (stageBreakdown || []).reduce((acc, x) => acc + x.value, 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const color = STAGE_COLORS[s.stage] || '#39FF14';
                return (
                  <div key={s.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white uppercase">{s.stage}</span>
                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span className="text-slate-400">{s.deals} DEALS</span>
                        <span className="font-bold text-white">
                          ${(s.value / 1000).toFixed(0)}k
                        </span>
                        <span className="text-slate-500">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#0B0C10] border border-[#3A4552]">
                      <div
                        className="h-full transition-none"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Velocity summary */}
            {velocity && (
              <div className="mt-3 pt-3 border-t border-[#3A4552] grid grid-cols-2 gap-2">
                {[
                  { label: 'WIN RATE', value: `${velocity.win_rate_percentage}%`, color: 'text-[#39FF14]' },
                  { label: 'AVG CYCLE', value: `${velocity.avg_sales_cycle_days}D`, color: 'text-[#FFB800]' },
                  { label: 'MONTHLY VELOCITY', value: `$${(velocity.monthly_velocity_arr / 1000).toFixed(0)}K`, color: 'text-cyan-400' },
                  { label: 'TOTAL PIPELINE', value: `$${((simulation?.pipeline_total_value || 0) / 1000).toFixed(0)}K`, color: 'text-white' },
                ].map((item) => (
                  <div key={item.label} className="p-2 bg-[#0B0C10] border border-[#3A4552]">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">{item.label}</span>
                    <span className={`text-sm font-black font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage Velocity Table */}
          <Card className="lg:col-span-2 p-4 bg-[#1F2833] border-[#3A4552] space-y-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#39FF14]" />
              PIPELINE STAGE VELOCITY &amp; CONVERSION MATRIX
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#3A4552] text-slate-400 font-bold uppercase text-[9px] bg-[#0B0C10]">
                    <th className="py-2 px-2.5">STAGE</th>
                    <th className="py-2 px-2.5">AVG DAYS</th>
                    <th className="py-2 px-2.5">CONVERSION RATE</th>
                    <th className="py-2 px-2.5">SLIPPAGE RISK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4552]">
                  {(velocity?.stages || []).map((s, idx) => (
                    <tr key={idx} className="odd:bg-[#161D26] even:bg-[#1F2833] hover:bg-[#26313F] transition-none">
                      <td className="py-2 px-2.5 text-white font-bold uppercase">{s.stage}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-300">{s.avg_days_in_stage} DAYS</td>
                      <td className="py-2 px-2.5 font-mono text-[#39FF14]">{s.conversion_rate}%</td>
                      <td className="py-2 px-2.5">
                        <Badge
                          variant={
                            s.slippage_risk === 'Low'
                              ? 'success'
                              : s.slippage_risk === 'Medium'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {s.slippage_risk.toUpperCase()}
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
        <div className="space-y-3">
          {!savedSimulations || savedSimulations.length === 0 ? (
            <Card className="p-10 text-center text-slate-500 text-xs font-mono uppercase">
              NO SAVED RUNS RECORDED. USE &ldquo;SAVE SCENARIO&rdquo; ABOVE TO PERSIST A RUN.
            </Card>
          ) : (
            <>
              {/* Scenario Table */}
              <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
                <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    PERSISTED MONTE CARLO SIMULATIONS
                  </h3>
                  <Badge variant="purple" className="text-[8px] font-mono">
                    {savedSimulations.length} SCENARIOS
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#3A4552] text-slate-400 font-bold uppercase text-[9px] bg-[#0B0C10]">
                        <th className="py-2 px-2.5">SCENARIO NAME</th>
                        <th className="py-2 px-2.5">QUARTER</th>
                        <th className="py-2 px-2.5">P10 (CONSERVATIVE)</th>
                        <th className="py-2 px-2.5">P50 (EXPECTED)</th>
                        <th className="py-2 px-2.5">P90 (OPTIMISTIC)</th>
                        <th className="py-2 px-2.5">SLIPPAGE</th>
                        <th className="py-2 px-2.5">SAVED</th>
                        <th className="py-2 px-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3A4552]">
                      {(savedSimulations || []).map((s: ForecastSimulationRecord) => (
                        <tr key={s.id} className="odd:bg-[#161D26] even:bg-[#1F2833] hover:bg-[#26313F] transition-none">
                          <td className="py-2 px-2.5 text-white font-bold uppercase max-w-[200px] truncate">
                            {s.name}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-400 uppercase">{s.target_quarter}</td>
                          <td className="py-2 px-2.5 font-mono text-cyan-400">
                            ${(s.p10_conservative / 1000).toFixed(1)}k
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[#FFB800] font-bold">
                            ${(s.p50_expected / 1000).toFixed(1)}k
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[#39FF14]">
                            ${(s.p90_optimistic / 1000).toFixed(1)}k
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-400">
                            {(s.deal_slippage_rate * 100).toFixed(0)}%
                          </td>
                          <td className="py-2 px-2.5 text-slate-500 font-mono text-[9px]">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2.5">
                            <button
                              type="button"
                              onClick={() => deleteMutation.mutate(s.id)}
                              className="p-1 text-slate-500 hover:text-[#FF2A54] transition-none"
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
                <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      SCENARIO P50 COMPARISON
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                      SIDE-BY-SIDE P50 EXPECTED ARR ACROSS PERSISTED SCENARIOS
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#3A4552" />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={9}
                          tickLine={false}
                          angle={-15}
                          textAnchor="end"
                          fontFamily="monospace"
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={9}
                          tickLine={false}
                          fontFamily="monospace"
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0B0C10',
                            borderColor: '#3A4552',
                            borderRadius: '0px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: '#F1F5F9',
                          }}
                          formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }} />
                        <Bar dataKey="p10" name="P10 Conservative" fill="#00E5FF" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="p50" name="P50 Expected" fill="#FFB800" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="p90" name="P90 Optimistic" fill="#39FF14" radius={[0, 0, 0, 0]} />
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
