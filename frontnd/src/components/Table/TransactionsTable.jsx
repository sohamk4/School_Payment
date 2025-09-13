import React from "react";
import TransactionRow from "./TransactionRow";

export default function TransactionsTable({ data }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded shadow overflow-x-auto">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-100 dark:bg-slate-700 text-left text-sm">
          <tr>
            <th className="p-2">Sr No</th>
            <th className="p-2">Institute Name</th>
            <th className="p-2">School ID</th>
            <th className="p-2">Date and Time</th>
            <th className="p-2">Custom Order ID</th>
            <th className="p-2">Order Amount</th>
            <th className="p-2">Transaction Amount</th>
            <th className="p-2">Payment Mode</th>
            <th className="p-2">Status</th>
            <th className="p-2">Student ID</th>
            <th className="p-2">Student Name</th>
            <th className="p-2">Phone No</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((tx, index) => (
            <TransactionRow key={tx.collect_id} tx={tx} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}