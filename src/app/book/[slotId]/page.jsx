import { getSlotDetails } from "@/actions/booking";
import BookingForm from "@/components/BookingForm";
import { format, parseISO, addMinutes } from "date-fns";
import { Clock, Calendar, Shield, AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createSessionClient } from "@/lib/appwrite";

export default async function CheckoutPage({ params, searchParams }) {
  const { slotId } = params;
  // Get duration from URL (default to 60 if missing)
  const duration = parseInt(searchParams.duration) || 60;

  // 1. Verify User
  try {
    const { account } = await createSessionClient();
    await account.get();
  } catch (error) {
    redirect(`/login?redirect=/book/${slotId}?duration=${duration}`);
  }

  // 2. Fetch Data
  const data = await getSlotDetails(slotId);
  if (!data || !data.slot) return notFound();

  const { slot, therapist, rates } = data;

  // 3. Calculate Dynamic Details
  const startTime = parseISO(slot.start_time);
  const endTime = addMinutes(startTime, duration);

  // Find price for this duration
  const rateDoc = rates.find((r) => r.duration_mins === duration);
  // Fallback price logic if specific rate not found (e.g. 1.5x for 90mins)
  let price = 2000;
  if (rateDoc) {
    price = rateDoc.price_inr;
  } else {
    // Intelligent fallback based on 60min rate
    const baseRate =
      rates.find((r) => r.duration_mins === 60)?.price_inr || 2000;
    price = Math.round(baseRate * (duration / 60));
  }

  // 4. Double Booking Guard
  if (slot.is_booked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl text-center shadow-lg max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Slot No Longer Available
          </h1>
          <p className="text-gray-500 mb-6">
            Sorry, this time slot was just booked by another client.
          </p>
          <a
            href="/search"
            className="inline-block w-full bg-secondary text-white px-6 py-3 rounded-xl font-medium hover:bg-[#5A7A66] transition-colors"
          >
            Find Another Slot
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Summary Card */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Review & Pay
            </h1>
            <p className="text-gray-500">Complete your booking securely.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl text-gray-400 font-bold overflow-hidden">
                {therapist.full_name ? therapist.full_name[0] : "T"}
              </div>
              <div>
                <h3 className="font-bold text-xl text-primary">
                  {therapist.full_name}
                </h3>
                <p className="text-sm text-gray-500">Licensed Therapist</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="text-gray-900 font-medium">
                    {format(startTime, "EEEE, MMMM do, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Time ({duration} Mins)
                  </p>
                  <p className="text-gray-900 font-medium">
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F2F5F4] p-5 rounded-2xl flex gap-4 text-sm text-gray-600 border border-secondary/10">
            <Shield className="text-secondary shrink-0" size={24} />
            <p className="leading-relaxed">
              <strong>100% Confidential.</strong> Your personal details are
              never shared with third parties. This session is covered by our
              cancellation policy.
            </p>
          </div>
        </div>

        {/* Right: Booking Form (Client Component) */}
        {/* Pass duration to form so it sends to backend */}
        <BookingForm
          slotId={slotId}
          price={price}
          therapist={therapist}
          duration={duration}
        />
      </div>
    </div>
  );
}
