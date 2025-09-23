"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Award, Globe, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: 500,
    suffix: "+",
    label: "Hospitals Served",
    description: "Healthcare facilities trust our equipment",
  },
  {
    icon: Award,
    number: 15,
    suffix: "+",
    label: "Years Experience",
    description: "Decades of medical technology expertise",
  },
  {
    icon: Globe,
    number: 50,
    suffix: "+",
    label: "Countries Reached",
    description: "Global presence and impact",
  },
  {
    icon: Heart,
    number: 99,
    suffix: "%",
    label: "Satisfaction Rate",
    description: "Healthcare professionals satisfaction",
  },
];

export default function StatsSection() {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounts();
          }
        });
      },
      { threshold: 0.3 }
    );

    observerRef.current = observer;
    const element = document.getElementById("stats-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounts = () => {
    // Reset counts to 0 first
    setCounts(stats.map(() => 0));

    // Small delay to ensure reset is complete
    setTimeout(() => {
      const targets = stats.map((stat) => stat.number);
      const startTime = performance.now();
      const duration = 2500; // 2.5 seconds for smooth animation

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const newCounts = targets.map((target) => {
          const currentValue = Math.floor(target * easeOutQuart);
          return Math.min(currentValue, target);
        });

        setCounts(newCounts);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, 100);
  };

  return (
    <section
      id="stats-section"
      className="section-padding bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800"
    >
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-white">
            Our <span className="gradient-text">Impact</span>
          </h2>
          <p className="text-xl text-secondary-200 max-w-3xl mx-auto">
            Numbers that reflect our commitment to advancing healthcare
            technology and improving patient care worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center glass rounded-xl p-6 card-hover"
            >
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <stat.icon className="w-8 h-8 text-primary-300" />
              </div>

              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {counts[index]}
                {stat.suffix}
              </div>

              <div className="text-lg font-semibold text-primary-200 mb-2">
                {stat.label}
              </div>

              <div className="text-sm text-secondary-200">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-secondary-200 mb-6">
            Join hundreds of healthcare facilities already benefiting from our
            advanced equipment
          </p>
          <button className="button-secondary">
            Learn More About Our Impact
          </button>
        </div>
      </div>
    </section>
  );
}
