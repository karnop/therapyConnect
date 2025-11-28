import { getMyClients } from "@/actions/crm";
import { format, parseISO } from "date-fns";
import { User, Search, Clock, ArrowRight, History } from "lucide-react";
import Link from "next/link";

export default async function ClientListPage() {
  const clients = await getMyClients();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Clients</h1>
          <p className="text-gray-500">People you have worked with.</p>
        </div>
        <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search clients..."
            className="outline-none text-gray-700"
            disabled
          />
        </div>
      </div>

      {clients.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-[#F2F5F4] text-xs uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Client Name</th>
                  <th className="px-6 py-4">Total Sessions</th>
                  <th className="px-6 py-4">Last Seen</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
                          {client.full_name?.[0] || "C"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {client.full_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {client.id.substring(0, 6)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {client.sessionCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(parseISO(client.lastSession), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {/* Link to the MOST RECENT session page, which shows full history */}
                      <Link href={`/therapist/session/${client.lastSessionId}`}>
                        <button className="text-secondary hover:text-white hover:bg-secondary border border-secondary/20 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all">
                          <History size={14} /> View History
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <User size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Clients Yet</h3>
          <p className="text-gray-500">
            Once you complete a session, your clients will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
