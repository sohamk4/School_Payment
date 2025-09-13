import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import TransactionsTable from "../components/Table/TransactionsTable";
import { Search, X, ChevronLeft, ChevronRight  } from "lucide-react";

export default function TransactionsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortTimestamp, setSortTimestamp] = useState(Date.now());
  const [sortOrder, setSortOrder] = useState('dsc'); 
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", filterBy, dateFilter, submittedSearch, statusFilter, instituteFilter, currentPage, itemsPerPage,sortOrder,sortTimestamp],
    queryFn: async () => {     
      const params = new URLSearchParams();
      
      if (dateFilter) params.append('day', dateFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (instituteFilter) params.append('institute_name', instituteFilter);
      if (filterBy !== 'all') params.append('sort',filterBy);
      if (submittedSearch) params.append('id',submittedSearch);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      params.append('order', sortOrder);
      
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/transactions?${params.toString()}`;
      const res = await axios.get(url); 
      return res.data;
    },
  });

  const { data: institutes } = useQuery({
    queryKey: ["institutes"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/allinstituename`);
      const uniqueInstitutes = res.data.data.filter((institute, index, self) =>
        index === self.findIndex((t) => t.name === institute.name)
      );     
      return uniqueInstitutes;
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm);
    setCurrentPage(1); 
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleInstituteChange = (value) => {
    setInstituteFilter(value); 
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubmittedSearch("");
    setFilterBy("all");
    setDateFilter("");
    setStatusFilter("");
    setInstituteFilter("");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (data?.pagination?.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (data?.pagination?.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "custom_order_id", label: "Order ID" },
    { value: "student_name", label: "Student" },
    { value: "status", label: "Status" },
    { value: "payment_mode", label: "Payment" }
  ];

  const dateOptions = [
    { value: "", label: "Date" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "thisweek", label: "This Week" },
    { value: "thismonth", label: "This Month" }
  ];

  const statusOptions = [
    { value: "", label: "Status" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
    { value: "NOT INITIATED", label: "Not Initiated" },
  ];

  const itemsPerPageOptions = [10, 20, 50, 100];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Transactions Overview</h1>
        {(dateFilter || statusFilter || instituteFilter || searchTerm) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-md"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 mb-4">
      <form onSubmit={handleSearch} className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-slate-600 h-9 bg-gray-100 dark:bg-slate-700 flex-1 max-w-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Customer Id"
            className="flex-1 px-3 text-sm focus:outline-none bg-transparent dark:text-white"
          />
          
          <div className="border-l border-gray-300 dark:border-slate-600 h-4"></div>
          
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="h-9 px-2 pr-8 bg-gray-100 dark:bg-slate-700 text-sm dark:text-white focus:outline-none w-32 appearance-none"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-slate-700 dark:text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="border-l border-gray-300 dark:border-slate-600 h-4"></div>
          <button
            type="button"
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc');
              setSortTimestamp(Date.now());
            }}
            className={`h-9 px-2 flex items-center justify-center transition-colors ${
              sortOrder === 'asc' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
            title={sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
          >
            {sortOrder === 'asc' ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
                    
            <button
            type="submit"
            className="h-9 px-3 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center">
            <Search size={16} />
          </button>
        </div>
      
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={dateFilter}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm appearance-none pr-8"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
      
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm appearance-none pr-8"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
      
          <div className="relative">
            <select 
              value={instituteFilter}
              onChange={(e) => handleInstituteChange(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm appearance-none pr-8 min-w-[120px]"
            >
              <option value="">Institute</option>
              {institutes?.map((institute) => (
                <option key={institute.id} value={institute.name}>
                  {institute.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

        </div>
      </form>
      </div>


      <TransactionsTable data={data?.data || []} />

      {data?.pagination && (
        <div className="flex items-center justify-between mt-4 bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Showing {((data.pagination.currentPage - 1) * data.pagination.itemsPerPage) + 1} to{" "}
              {Math.min(data.pagination.currentPage * data.pagination.itemsPerPage, data.pagination.totalItems)} of{" "}
              {data.pagination.totalItems} entries
            </span>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="h-8 px-2 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={!data.pagination.hasPrevPage}
              className="h-8 px-3 flex items-center justify-center border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`h-8 w-8 flex items-center justify-center border rounded-md text-sm ${
                    data.pagination.currentPage === pageNum
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={goToNextPage}
              disabled={!data.pagination.hasNextPage}
              className="h-8 px-3 flex items-center justify-center border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
