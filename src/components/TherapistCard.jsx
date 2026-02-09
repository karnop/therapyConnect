import Link from "next/link";
import Image from "next/image";
import { MapPin, Video, Calendar, ArrowRight, User } from "lucide-react";
import { formatTimeIST, formatDateIST } from "@/lib/date"; // NEW IMPORT

export default function TherapistCard({ data }) {
  const isOnline = !!data.meeting_link;
  const locationText = data.metro_station
    ? `${data.metro_station}, Delhi`
    : isOnline
      ? "Online Only"
      : "Location hidden";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full overflow-hidden">
      {/* ... (Header & Bio & Specialties Code Remains Same) ... */}
      <div className="p-6 flex items-start gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {data.avatarUrl ? (
            <Image
              src={data.avatarUrl}
              alt={data.full_name}
              fill
              className="object-cover rounded-full border-2 border-gray-50"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <User size={24} />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-primary group-hover:text-secondary transition-colors">
            {data.full_name}
          </h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            Licensed Therapist
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {isOnline ? (
              <Video size={12} className="text-blue-500" />
            ) : (
              <MapPin size={12} className="text-orange-500" />
            )}
            {locationText}
          </div>
        </div>
      </div>
      {data.bio && (
        <div className="px-6 pb-3">
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {data.bio}
          </p>
        </div>
      )}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {data.specialties?.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100"
            >
              {tag}
            </span>
          ))}
          {data.specialties?.length > 3 && (
            <span className="px-2 py-1 text-gray-400 text-[10px] font-medium">
              +{data.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-gray-100 p-4 bg-gray-50/50">
        {/* Availability Info using IST Helpers */}
        <div className="mb-4">
          {data.nextSlot ? (
            <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
              <Calendar size={14} />
              Next: {formatDateIST(data.nextSlot.start_time)} •{" "}
              {formatTimeIST(data.nextSlot.start_time)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg w-fit">
              <Calendar size={14} />
              No slots available soon
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Per Session</p>
            <p className="font-bold text-lg text-primary">₹{data.price}</p>
          </div>
          <Link href={`/profile/${data.$id}`}>
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              Book <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
