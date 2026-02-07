import { getBookingAuditLog } from "@/actions/admin";
import { format, parseISO } from "date-fns";
import { FileText, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import Link from "next/link";
import BookingFilters from "@/components/admin/BookingFilters"; // Import the new component

export default async function BookingAuditPage({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const query = searchParams.query || "";
  const status = searchParams.status || "all";

  // Fetch data on the server
  const {
    data: bookings,
    total,
    pages,
  } = await getBookingAuditLog(page, query, status);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Booking Audit Log</h1>
        <p className="text-gray-500">Track all transactions and disputes.</p>
      </div>

      {/* Insert Client Component for Filters */}
      <BookingFilters initialQuery={query} initialStatus={status} />

      {/* TABLE (Server Component Part) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Therapist</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.$id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">
                    {format(parseISO(b.$createdAt), "MMM d, HH:mm")}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {b.clientName}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{b.therapistName}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {b.transaction_id ? (
                      <span className="flex items-center gap-1">
                        <Wallet size={12} className="text-gray-400" />
                        {b.transaction_id}
                      </span>
                    ) : (
                      <span className="opacity-50">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">
              No bookings found matching filters.
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Page {page} of {pages} ({total} items)
          </span>
          <div className="flex gap-2">
            <Link
              href={`/admin/bookings?page=${page > 1 ? page - 1 : 1}&query=${query}&status=${status}`}
            >
              <button
                disabled={page <= 1}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
            </Link>
            <Link
              href={`/admin/bookings?page=${page < pages ? page + 1 : pages}&query=${query}&status=${status}`}
            >
              <button
                disabled={page >= pages}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    pending_approval: "bg-orange-100 text-orange-700",
    awaiting_payment: "bg-blue-100 text-blue-700",
    payment_verification: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
