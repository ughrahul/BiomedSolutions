"use client";

import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    role: "Neurologist",
    hospital: "ANIAS Hospital",
    content:
      "The Deep Brain Stimulation system from Biomed Solutions has transformed our treatment of movement disorders. Their expertise and support have been invaluable for our patients.",
    rating: 5,
    image: "/assets/images/logo.png",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    role: "Neurosurgeon",
    hospital: "Kathmandu Medical Center",
    content:
      "The Neuronavigation System has significantly improved our surgical precision. Biomed Solutions' collaboration with international partners brings world-class technology to Nepal.",
    rating: 5,
    image: "/assets/images/logo.png",
  },
  {
    id: 3,
    name: "Dr. Amit Patel",
    role: "Orthopedic Surgeon",
    hospital: "Bir Hospital",
    content:
      "The 3D printed customized bone implants have revolutionized our approach to complex fractures. The local manufacturing capability is a game-changer for patient care.",
    rating: 5,
    image: "/assets/images/logo.png",
  },
  {
    id: 4,
    name: "Dr. Sunita Thapa",
    role: "Hospital Administrator",
    hospital: "Provincial Hospital",
    content:
      "Biomed Solutions provides quality medical equipment at affordable costs. Their maintenance services ensure our devices work optimally, supporting healthcare delivery across Nepal.",
    rating: 5,
    image: "/assets/images/logo.png",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-secondary-800">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Hear from healthcare professionals across Nepal who trust our innovative 
            solutions to deliver advanced patient care.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="glass rounded-2xl p-8 md:p-12">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <Quote className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      )
                    )}
                  </div>

                  <blockquote className="text-lg md:text-xl text-white mb-6 leading-relaxed">
                    "{testimonials[currentIndex].content}"
                  </blockquote>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonials[currentIndex].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-sm text-secondary-300">
                        {testimonials[currentIndex].role}
                      </div>
                      <div className="text-sm text-primary-400">
                        {testimonials[currentIndex].hospital}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary-500 scale-125"
                      : "bg-secondary-600 hover:bg-secondary-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-secondary-300 mb-6">
            Join healthcare institutions across Nepal who trust our innovative solutions
          </p>
          <button className="button-secondary">Read More Testimonials</button>
        </div>
      </div>
    </section>
  );
}
