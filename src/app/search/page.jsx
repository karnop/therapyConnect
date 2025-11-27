import { getTherapists } from "@/actions/search";
import TherapistCard from "@/components/TherapistCard";
import { Search as SearchIcon, SlidersHorizontal, MapPin } from "lucide-react";
import { SPECIALTIES_LIST } from "@/lib/constants";

// This is a Server Component that receives searchParams directly
export default async function SearchPage({ searchParams }) {
  // Fetch data on the server
  const therapists = await getTherapists(searchParams);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* Header & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <SearchIcon
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                name="query"
                defaultValue={searchParams.query}
                type="text"
                placeholder="Search by name or keyword..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
              <div className="relative min-w-[200px]">
                <select
                  name="specialty"
                  defaultValue={searchParams.specialty}
                  className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-secondary focus:border-secondary outline-none cursor-pointer"
                >
                  <option value="">All Specialties</option>
                  {SPECIALTIES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                  <SlidersHorizontal size={16} />
                </div>
              </div>

              <button
                type="submit"
                className="bg-secondary hover:bg-[#5A7A66] text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-soft"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Available Therapists
            </h1>
            <p className="text-gray-500">
              Showing {therapists.length} professionals in Delhi NCR
            </p>
          </div>
        </div>

        {therapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist) => (
              <TherapistCard key={therapist.$id} data={therapist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <SearchIcon size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No matches found
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              Try adjusting your filters or search for a different specialty.
            </p>
            <a
              href="/search"
              className="inline-block mt-6 text-secondary font-medium hover:underline"
            >
              Clear all filters
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
