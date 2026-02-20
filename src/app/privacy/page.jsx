import { Shield, Lock, FileText, Calendar, EyeOff, Mail } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "February 20, 2026";

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-2xl mb-6 text-secondary">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* CONTENT BLOCKS */}
        <div className="space-y-8">
          {/* Section 1: Intro */}
          <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <FileText className="text-gray-400" size={24} />
              1. Introduction
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Welcome to TherapyConnect. We believe that mental health care
                requires the highest standard of privacy. This policy outlines
                how we collect, use, and protect your personal data when you use
                our platform as a client or a therapist.
              </p>
            </div>
          </section>

          {/* Section 2: Data Collection */}
          <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <EyeOff className="text-gray-400" size={24} />
              2. Data We Collect
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                We only collect information that is absolutely necessary to
                provide our services:
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-secondary">
                <li>
                  <strong>Identity Data:</strong> Name, email address, and phone
                  number.
                </li>
                <li>
                  <strong>Booking Data:</strong> Session dates, times, and
                  payment statuses.
                </li>
                <li>
                  <strong>Clinical Notes:</strong> Information provided in your
                  &quot;Private Journal&quot; or &quot;Prep Notes&quot;.
                </li>
                <li>
                  <strong>Professional Data (Therapists):</strong>{" "}
                  Qualifications, RCI numbers, and payout details.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Google API (CRITICAL FOR VERIFICATION) */}
          <section className="bg-[#2D2D2D] p-8 md:p-10 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar size={120} />
            </div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 relative z-10">
              <Calendar className="text-blue-400" size={24} />
              3. Google Workspace APIs (Limited Use)
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4 relative z-10 text-sm md:text-base">
              <p>
                For therapists who choose to integrate their schedules,
                TherapyConnect uses Google Calendar APIs to prevent
                double-booking and automate scheduling.
              </p>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <p className="font-medium text-white mb-2">
                  Google API Services User Data Policy Disclosure:
                </p>
                <p>
                  TherapyConnect&quot;s use and transfer to any other app of
                  information received from Google APIs will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  We only <strong>read</strong> your calendar events to
                  calculate availability.
                </li>
                <li>
                  We only <strong>write</strong> to your calendar to add
                  sessions booked through TherapyConnect.
                </li>
                <li>
                  We <strong>do not</strong> share, sell, or use your calendar
                  data for advertising or any other purpose.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Security */}
          <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
              <Lock className="text-gray-400" size={24} />
              4. Data Security & Encryption
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>Your privacy is our architectural foundation.</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-secondary">
                <li>
                  <strong>Encrypted Journals:</strong> Your personal journals
                  and intake forms are cryptographically encrypted in our
                  database.
                </li>

                <li>
                  <strong>Secure Infrastructure:</strong> We utilize
                  industry-standard security protocols to protect against
                  unauthorized access or data breaches.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Contact */}
          <section className="bg-[#FAFAF8] p-8 md:p-10 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4 text-gray-400">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Questions about your privacy?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              If you have any questions, concerns, or requests regarding your
              data, our data protection team is here to help.
            </p>
            <a
              href="mailto:Founder.therapyconnect@gmail.com"
              className="inline-block bg-secondary hover:bg-[#4A6A56] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
            >
              Founder.therapyconnect@gmail.com
            </a>
          </section>
        </div>

        {/* FOOTER LINK */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-secondary font-medium transition-colors"
          >
            &larr; Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
