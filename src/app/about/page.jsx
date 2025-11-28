import { Shield, Heart, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#F2F5F4] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Mental healthcare meant for{" "}
            <span className="text-secondary italic">you.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            TherapyConnect was built to bridge the gap between finding a
            therapist and actually starting therapy. No directories, no cold
            calls—just booking.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Finding the right therapist in Delhi NCR shouldn&apos;t feel like
              a part-time job. We verified hundreds of professionals to create a
              safe, transparent marketplace where you can see real availability
              and book instantly.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-gray-700">
                  100% Verified RCI/Medical Credentials
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-gray-700">
                  Transparent Pricing (No hidden fees)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-gray-700">Privacy-First Platform</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-100 rounded-3xl h-80 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-blue-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={64} className="text-secondary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-primary text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <Shield size={32} className="text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Safety First</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Every therapist on our platform undergoes a manual verification
                process of their degree and license.
              </p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <Users size={32} className="text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Human Connection</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                We believe in the power of the therapeutic relationship. Our
                &apos;Vibe Check&apos; videos help you find the right match.
              </p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <Heart size={32} className="text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Accessibility</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Mental health support should be accessible. We offer options for
                online sessions and clinics near Metro stations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Ready to begin?
        </h2>
        <Link href="/search">
          <button className="bg-secondary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5A7A66] transition-colors">
            Find a Therapist
          </button>
        </Link>
      </section>
    </div>
  );
}
