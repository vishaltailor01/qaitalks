"use client";

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Rocket, ShieldCheck, Zap } from 'lucide-react';

interface QuickCheckSummaryProps {
    score: number;
    missingKeywords: string[];
    recommendations: string[];
    onUnlockPack: () => void;
    isLoading?: boolean;
}

export default function QuickCheckSummary({
    score,
    missingKeywords,
    recommendations,
    onUnlockPack,
    isLoading = false
}: QuickCheckSummaryProps) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-500 from-green-400 to-emerald-600';
        if (s >= 50) return 'text-amber-500 from-amber-400 to-orange-500';
        return 'text-red-500 from-red-400 to-rose-600';
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return 'High Match';
        if (s >= 50) return 'Medium Match';
        return 'Low Match';
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Score Header */}
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364}
                                strokeDashoffset={364 - (364 * score) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" className="stop-color-current" />
                                    <stop offset="100%" className="stop-color-current" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-black bg-gradient-to-br ${getScoreColor(score)} bg-clip-text text-transparent`}>
                                {score}%
                            </span>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">ATS Match Score</h3>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${score >= 80 ? 'bg-green-100 text-green-700' :
                                    score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {getScoreLabel(score)}
                            </span>
                            <span className="text-slate-500 text-sm">Based on QA JD Analysis</span>
                        </div>
                        <p className="mt-4 text-slate-600 max-w-md">
                            Our AI analysed your CV against the specific requirements and keywords of this QA role.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Keywords */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="text-signal-yellow" size={20} />
                        <h4 className="font-bold text-slate-800">Missing Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missingKeywords.length > 0 ? (
                            missingKeywords.slice(0, 12).map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-200 hover:border-signal-yellow transition-colors cursor-default">
                                    {kw}
                                </span>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic">No critical keywords missing!</p>
                        )}
                        {missingKeywords.length > 12 && (
                            <span className="text-slate-400 text-sm self-center">+{missingKeywords.length - 12} more</span>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="text-logic-cyan" size={20} />
                        <h4 className="font-bold text-slate-800">Top Recommendations</h4>
                    </div>
                    <ul className="space-y-3">
                        {recommendations.slice(0, 4).map((rec, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                                <div className="mt-1 flex-shrink-0">
                                    <CheckCircle className="text-green-500 group-hover:scale-110 transition-transform" size={16} />
                                </div>
                                <span className="text-sm text-slate-600 leading-relaxed">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-deep-blueprint to-blue-900 rounded-3xl p-8 text-white shadow-2xl border-2 border-white/20">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-signal-yellow/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-logic-cyan/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">Unlock Your Full Application Pack</h3>
                        <p className="text-blue-100 max-w-lg mb-0 text-sm md:text-base">
                            Get a professionally rewritten CV, tailored cover letter, and a mock interview question pack specifically optimized for this job.
                        </p>
                    </div>

                    <button
                        onClick={onUnlockPack}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-signal-yellow to-amber-500 text-deep-navy font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-70 group whitespace-nowrap"
                    >
                        <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
                        Unlock Now — £4.99
                    </button>
                </div>
            </div>
        </div>
    );
}
