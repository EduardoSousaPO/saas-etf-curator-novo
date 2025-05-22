// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ETF } from "../../types";
import { toast } from "react-hot-toast";

interface RankingsData {
  top_returns_12m: ETF[];
  top_sharpe_12m: ETF[];
  top_dividend_yield: ETF[];
  largest_total_assets: ETF[];
  highest_volume: ETF[];
  lowest_max_drawdown: ETF[];
  lowest_volatility_12m: ETF[];
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Fetch rankings from the new Prisma-based API endpoint
        const response = await fetch('/api/etfs/rankings');
        if (!response.ok) {
          throw new Error('Failed to fetch rankings');
        }
        const data = await response.json();
        setRankings(data);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        toast.error('Failed to load ETF rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">ETF Rankings</h1>
        <div className="text-center py-10">Loading rankings...</div>
      </div>
    );
  }

  if (!rankings) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">ETF Rankings</h1>
        <div className="text-center py-10 text-red-500">Failed to load rankings. Please try again later.</div>
      </div>
    );
  }

  const renderRankingTable = (title: string, etfs: ETF[], metric: keyof ETF, isHigherBetter: boolean = true) => {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 border-b text-left">Rank</th>
                <th className="py-2 px-4 border-b text-left">Symbol</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-right">{metric.toString().replace('_', ' ').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {etfs.map((etf, index) => (
                <tr key={etf.symbol} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b font-medium">{etf.symbol}</td>
                  <td className="py-2 px-4 border-b">{etf.name}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {metric === 'dividend_yield' || metric === 'returns_12m' || metric === 'volatility_12m' || metric === 'max_drawdown'
                      ? `${Number(etf[metric]).toFixed(2)}%`
                      : metric === 'total_assets' || metric === 'volume'
                      ? `$${Number(etf[metric]).toLocaleString()}`
                      : Number(etf[metric]).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ETF Rankings</h1>
      
      {renderRankingTable('Top Returns (12 Months)', rankings.top_returns_12m, 'returns_12m')}
      {renderRankingTable('Top Sharpe Ratio (12 Months)', rankings.top_sharpe_12m, 'sharpe_12m')}
      {renderRankingTable('Top Dividend Yield', rankings.top_dividend_yield, 'dividend_yield')}
      {renderRankingTable('Largest ETFs by Assets', rankings.largest_total_assets, 'total_assets')}
      {renderRankingTable('Highest Trading Volume', rankings.highest_volume, 'volume')}
      {renderRankingTable('Lowest Maximum Drawdown', rankings.lowest_max_drawdown, 'max_drawdown', false)}
      {renderRankingTable('Lowest Volatility (12 Months)', rankings.lowest_volatility_12m, 'volatility_12m', false)}
    </div>
  );
}
