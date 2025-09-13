import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import TransactionsTable from "../components/Table/TransactionsTable";

export default function TransactionDetailsBySchool() {
  const [schoolId, setSchoolId] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["transactionsBySchool", schoolId],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/transactions/school/${schoolId}`);
      return res.data.data;
    },
    enabled: false,
  });

  const handleSearch = () => {
    if (schoolId.trim()) {
      refetch();
    }
  };

  return (
    <div>
      <h1 className="text-xl mb-4">Transactions by School</h1>
      <div className="flex gap-2 mb-4">
      <input
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
        placeholder="Enter School ID"
        className="p-2 border rounded bg-white dark:bg-slate-700 text-black dark:text-white border-gray-300 dark:border-slate-600 focus:outline-none"
      />

        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
        >
          Search
        </button>

      </div>
      {data && <TransactionsTable data={data} />}
    </div>
  );
}
