import React, { useState } from "react";
import axios from "axios";

export default function TransactionStatusCheck() {
  const [schoolId, setSchoolId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    try {
        const params = {};
        if (schoolId) params.school_id = schoolId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/transac-stats`, { params });

        setStats(res.data.data);
    } catch (err) {
        setError(err.response?.data?.message || "Error fetching statistics");
        setStats(null);
    } finally {
        setLoading(false);
    }
  };

  const handleReset = () => {
    setSchoolId("");
    setDateFrom("");
    setDateTo("");
    setStats(null);
    setError("");
  };

  return (
    <div>
      <h1 className="text-xl mb-4">Transaction Statistics</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">School ID</label>
            <input
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="Enter School ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Statistics"}
          </button>
          
          <button
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-full  dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {stats && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Transaction Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Transactions</h3>
              <p className="text-2xl font-bold">{stats.total_transactions}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</h3>
              <p className="text-2xl font-bold">₹{stats.total_amount?.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</h3>
              <p className="text-2xl font-bold">{stats.success_rate}%</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-300">Successful</h3>
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                {stats.successful_transactions}
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                ₹{stats.successful_amount?.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-300">Failed</h3>
              <p className="text-2xl font-bold text-red-700 dark:text-red-200">
                {stats.failed_transactions}
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending</h3>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
                {stats.pending_transactions}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}