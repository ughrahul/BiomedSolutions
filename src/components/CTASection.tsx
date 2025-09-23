"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

export default function CTASection() {
  const { settings } = useWebsiteSettings();

  return (
    <section className="section-padding bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800">
      <div className="container-custom">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-white">
            Ready to <span className="gradient-text">Transform</span> Your
            Healthcare?
          </h2>

          <p className="text-xl md:text-2xl text-secondary-200 mb-8 leading-relaxed">
            Join hundreds of healthcare facilities already benefiting from our
            advanced medical equipment. Let&apos;s discuss how we can enhance your
            patient care capabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Phone className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
              <p className="text-secondary-200 text-sm">
                Speak with our experts
              </p>
              <p className="text-primary-300 font-medium">{settings.contact.phone}</p>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Email Us
              </h3>
              <p className="text-secondary-200 text-sm">
                Get detailed information
              </p>
              <p className="text-primary-300 font-medium">
                {settings.contact.email}
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-white/20">
                <ArrowRight className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Visit Us
              </h3>
              <p className="text-secondary-200 text-sm">
                Schedule a consultation
              </p>
              <p className="text-primary-300 font-medium">Book Appointment</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="button-primary group">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link href="/products" className="button-secondary group">
              Explore Products
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-secondary-200 text-sm">
              Available 24/7 for emergency support • Free consultation • No
              obligation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
