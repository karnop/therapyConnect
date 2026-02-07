import { getClientDirectory } from "@/actions/admin";
import { format, parseISO } from "date-fns";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

export default async function UserBasePage({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const query = searchParams.query || "";

  const { data: users, total, pages } = await getClientDirectory(page, query);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Base</h1>
        <p className="text-gray-500">Directory of registered clients.</p>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <form className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="query"
              defaultValue={query}
              type="text"
              placeholder="Search by Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 outline-none text-sm"
            />
          </div>
          <button className="bg-gray-900 text-white px-5 rounded-xl text-sm font-bold">
            Search
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined On</th>
                <th className="px-6 py-4">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.$id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {u.full_name?.[0]}
                      </div>
                      <span className="font-bold text-gray-900">
                        {u.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="text-xs">{u.email}</div>
                    <div className="text-xs">{u.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(parseISO(u.$createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_verified ? (
                      <span className="text-green-600 font-bold text-xs">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">
              No users found.
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
              href={`/admin/users?page=${page > 1 ? page - 1 : 1}&query=${query}`}
            >
              <button
                disabled={page <= 1}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
            </Link>
            <Link
              href={`/admin/users?page=${page < pages ? page + 1 : pages}&query=${query}`}
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
