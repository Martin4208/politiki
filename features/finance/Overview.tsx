'use client';

import { useState } from 'react';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, Cell,
} from 'recharts';

// ─── Static Data ──────────────────────────────────────────────────────────────

const ANNUAL_DATA = [
    { year: 1960, expenditure: 1.7,  tax: 1.6 },
    { year: 1965, expenditure: 3.7,  tax: 3.5 },
    { year: 1970, expenditure: 8.2,  tax: 7.9 },
    { year: 1975, expenditure: 20.9, tax: 13.2 },
    { year: 1980, expenditure: 43.4, tax: 26.9 },
    { year: 1985, expenditure: 53.0, tax: 38.2 },
    { year: 1990, expenditure: 66.5, tax: 60.1 },
    { year: 1995, expenditure: 75.9, tax: 51.9 },
    { year: 2000, expenditure: 89.3, tax: 50.7 },
    { year: 2005, expenditure: 82.2, tax: 49.1 },
    { year: 2010, expenditure: 92.3, tax: 41.5 },
    { year: 2011, expenditure: 100.7, tax: 42.8 },
    { year: 2012, expenditure: 97.1,  tax: 43.9 },
    { year: 2013, expenditure: 100.2, tax: 47.0 },
    { year: 2014, expenditure: 99.0,  tax: 53.9 },
    { year: 2015, expenditure: 96.3,  tax: 56.3 },
    { year: 2016, expenditure: 97.5,  tax: 55.5 },
    { year: 2017, expenditure: 99.7,  tax: 58.8 },
    { year: 2018, expenditure: 99.0,  tax: 60.4 },
    { year: 2019, expenditure: 101.5, tax: 62.5 },
    { year: 2020, expenditure: 175.7, tax: 60.8 },
    { year: 2021, expenditure: 142.7, tax: 67.0 },
    { year: 2022, expenditure: 107.6, tax: 71.1 },
    { year: 2023, expenditure: 112.6, tax: 69.4 },
];

const PRIMARY_BALANCE = [
    { year: 2010, value: -32.4 },
    { year: 2011, value: -36.1 },
    { year: 2012, value: -28.4 },
    { year: 2013, value: -24.3 },
    { year: 2014, value: -17.5 },
    { year: 2015, value: -13.4 },
    { year: 2016, value: -14.8 },
    { year: 2017, value: -9.8 },
    { year: 2018, value: -7.6 },
    { year: 2019, value: -5.9 },
    { year: 2020, value: -55.8 },
    { year: 2021, value: -26.3 },
    { year: 2022, value: -2.3 },
    { year: 2023, value: -5.3 },
];

const BUDGET_VS_ACTUAL = [
    { year: '2019', budget: 101.5, actual: 99.7 },
    { year: '2020', budget: 175.7, actual: 147.5 },
    { year: '2021', budget: 142.7, actual: 131.0 },
    { year: '2022', budget: 107.5, actual: 107.6 },
    { year: '2023', budget: 114.4, actual: 112.6 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'postwar' | '1985' | '2005';
type ChartType = 'area' | 'line';

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
    label, value, unit, sub, negative,
}: {
    label: string;
    value: string;
    unit: string;
    sub?: string;
    negative?: boolean;
}) {
    return (
        <div className="border rounded-xl p-4 space-y-1">
            <div className="text-xs text-muted-foreground leading-snug">{label}</div>
            <div className="flex items-end gap-1">
                <span className={`text-2xl font-bold tabular-nums ${negative ? 'text-red-600' : ''}`}>
                    {value}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
            </div>
            {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
    );
}

function ToggleGroup<T extends string>({
    options, value, onChange,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex rounded-md border overflow-hidden text-xs">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 transition-colors ${value === opt.value ? 'bg-black text-white' : 'hover:bg-accent'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Overview() {
    const [period, setPeriod] = useState<Period>('2005');
    const [chartType, setChartType] = useState<ChartType>('area');

    const latest = ANNUAL_DATA[ANNUAL_DATA.length - 1];
    const latestPB = PRIMARY_BALANCE[PRIMARY_BALANCE.length - 1];
    const bondDep = ((latest.expenditure - latest.tax) / latest.expenditure * 100).toFixed(1);

    const periodFrom: Record<Period, number> = { postwar: 1960, '1985': 1985, '2005': 2005 };
    const trendData = ANNUAL_DATA
        .filter(d => d.year >= periodFrom[period])
        .map(d => ({
            year: d.year,
            tax: d.tax,
            gap: parseFloat((d.expenditure - d.tax).toFixed(1)),
            expenditure: d.expenditure,
        }));

    const bondRatioData = ANNUAL_DATA
        .filter(d => d.year >= 2005)
        .map(d => ({
            year: d.year,
            ratio: parseFloat(((d.expenditure - d.tax) / d.expenditure * 100).toFixed(1)),
        }));

    const tooltipStyle = { fontSize: 12, borderRadius: 8 };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">財政データ</h1>
                <p className="text-xs text-muted-foreground">
                    一般会計 歳入・歳出決算 ／ データ源：財務省 財政統計 ／ 単位：兆円
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                    label={`歳出決算（${latest.year}年度）`}
                    value={latest.expenditure.toFixed(1)}
                    unit="兆円"
                />
                <KpiCard
                    label={`税収（${latest.year}年度）`}
                    value={latest.tax.toFixed(1)}
                    unit="兆円"
                    sub="一般会計税収"
                />
                <KpiCard
                    label={`税外依存分（${latest.year}年度）`}
                    value={(latest.expenditure - latest.tax).toFixed(1)}
                    unit="兆円"
                    sub={`国債依存度 ${bondDep}%`}
                    negative
                />
                <KpiCard
                    label={`基礎的財政収支（${latestPB.year}年度）`}
                    value={latestPB.value.toFixed(1)}
                    unit="兆円"
                    sub="赤字（プライマリーバランス）"
                    negative
                />
            </div>

            {/* Chart 1: Long-term trends */}
            <div className="border rounded-xl overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">歳出・税収の長期推移</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                一般会計 歳出決算 vs 税収（兆円）　差分 = 公債金・税外収入
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <ToggleGroup<ChartType>
                                options={[{ value: 'area', label: '面積' }, { value: 'line', label: '折れ線' }]}
                                value={chartType}
                                onChange={setChartType}
                            />
                            <ToggleGroup<Period>
                                options={[
                                    { value: 'postwar', label: '戦後～' },
                                    { value: '1985', label: '1985～' },
                                    { value: '2005', label: '直近20年' },
                                ]}
                                value={period}
                                onChange={setPeriod}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                        {chartType === 'area' ? (
                            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}兆`} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={((value: number) => `${(value as number).toFixed(1)}兆円`) as any}
                                    labelFormatter={v => `${v}年度`}
                                />
                                <Area type="monotone" dataKey="tax" stackId="1" stroke="#000" fill="#000" fillOpacity={0.85} name="税収" />
                                <Area type="monotone" dataKey="gap" stackId="1" stroke="#d1d5db" fill="#e5e7eb" name="公債金・税外収入" />
                            </AreaChart>
                        ) : (
                            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}兆`} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={((value: number) => `${(value as number).toFixed(1)}兆円`) as any}
                                    labelFormatter={v => `${v}年度`}
                                />
                                <Line type="monotone" dataKey="expenditure" stroke="#000" dot={false} strokeWidth={2} name="歳出" />
                                <Line type="monotone" dataKey="tax" stroke="#9ca3af" dot={false} strokeWidth={2} name="税収" />
                            </LineChart>
                        )}
                    </ResponsiveContainer>

                    <div className="flex gap-5 mt-3 text-xs text-muted-foreground justify-center">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-black inline-block" /> 税収
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300 inline-block" /> 公債金・税外収入（差分）
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart 2: Primary balance */}
            <div className="border rounded-xl overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">基礎的財政収支（プライマリーバランス）の推移</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        国債費を除く歳出 − 公債金を除く歳入（兆円）　0以上で財政黒字
                    </p>
                </div>
                <div className="p-4">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={PRIMARY_BALANCE} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}兆`} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={((v: number) => `${(v as number).toFixed(1)}兆円`) as any}
                                labelFormatter={v => `${v}年度`}
                            />
                            <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                                {PRIMARY_BALANCE.map((entry, i) => (
                                    <Cell key={i} fill={entry.value < 0 ? '#ef4444' : '#22c55e'} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        ※ 2020年度はコロナ対策の大規模補正予算の影響
                    </p>
                </div>
            </div>

            {/* Chart 3: Budget vs Actual */}
            <div className="border rounded-xl overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">予算 vs 決算（歳出）</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">当初予算額 vs 歳出決算額（兆円）</p>
                </div>
                <div className="p-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={BUDGET_VS_ACTUAL} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `${v}年度`} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}兆`} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={((v: number) => `${(v as number).toFixed(1)}兆円`) as any}
                                labelFormatter={v => `${v}年度`}
                            />
                            <Bar dataKey="budget" fill="#d1d5db" name="当初予算" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="actual" fill="#000" name="決算" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 mt-3 text-xs text-muted-foreground justify-center">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" /> 当初予算
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-black inline-block" /> 決算
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart 4: Bond dependency ratio */}
            <div className="border rounded-xl overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">国債依存度の推移</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        （歳出 − 税収）÷ 歳出 × 100（%）　歳出のうち税収でまかなえない割合
                    </p>
                </div>
                <div className="p-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={bondRatioData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                                tickFormatter={v => `${v}%`} domain={[0, 70]}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={((v: number) => `${v}%`) as any}
                                labelFormatter={v => `${v}年度`}
                            />
                            <ReferenceLine
                                y={50} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1}
                                label={{ value: '50%ライン', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
                            />
                            <Line
                                type="monotone" dataKey="ratio" stroke="#000"
                                dot={{ r: 3, fill: '#000' }} strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
