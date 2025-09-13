import React from "react";
import { Copy } from "lucide-react";
export default function TransactionRow({ tx, index }) {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <tr className="group hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200 ease-in-out transform hover:scale-[1.01] border-b border-gray-100 dark:border-slate-600">
      <td className="p-3 group-hover:font-medium">{index + 1}</td>
      <td className="p-3">
        {tx.instituteName || "N/A"}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
            {tx.school_id || "N/A"}
          {tx.school_id && (
            <button
              className="text-xs p-1 border border-gray-300 rounded opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => handleCopy(tx.school_id)}
              title="Copy Custom Order ID"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </td>
      <td className="p-3 ">
        {formatDateTime(tx.createdAt || tx.date)}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
            {tx.custom_order_id || "N/A"}
          {tx.custom_order_id && (
            <button
              className="text-xs p-1 border border-gray-300 rounded opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => handleCopy(tx.custom_order_id)}
              title="Copy Custom Order ID"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </td>
      <td className="p-3 ">
        {tx.order_amount || "N/A"}
      </td>
      <td className="p-3 ">
        {tx.transaction_amount || "N/A"}
      </td>
      <td className="p-3 ">
        {tx.payment_mode || "N/A"}
      </td>
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            tx.status === "success" || tx.status === "completed"
              ? "bg-green-100 text-green-800 "
              : tx.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          } transition-colors duration-200`}
        >
          {tx.status || "N/A"}
        </span>
      </td>
      <td className="p-3">
        {tx.student_info.id || "N/A"}
      </td>
      <td className="p-3 ">
        {tx.student_info.name || "N/A"}
      </td>
      <td className="p-3 ">
        {tx.student_info.phone_no|| "N/A"}
      </td>
    </tr>
  );
}