"use client";

import { Search, Filter } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function BookingFilters({ initialQuery, initialStatus }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle Dropdown Change
  const handleStatusChange = (e) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    // Reset page to 1 when filter changes
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Handle Search Submit
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex-1 relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="query"
            defaultValue={initialQuery}
            type="text"
            placeholder="Search by Transaction ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-400" />
        <select
          value={initialStatus}
          onChange={handleStatusChange}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending_approval">Pending</option>
          <option value="awaiting_payment">Awaiting Payment</option>
          <option value="payment_verification">Verifying</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
}
