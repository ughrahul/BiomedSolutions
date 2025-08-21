"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Building2, Award, Heart, Globe, Calendar, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useRef, useState } from "react";

export default function CompanyStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTimeline, setActiveTimeline] = useState(0);

  const milestones = [
    {
      year: "2015",
      title: "Foundation",
      description: "Established as a wing of Annapurna Neurological Institute & Allied Sciences (ANIAS).",
      icon: Building2,
      color: "from-blue-500 to-cyan-500",
      achievement: "ANIAS Partnership"
    },
    {
      year: "2016",
      title: "DBS Introduction",
      description: "Began Deep Brain Stimulation system implementation in collaboration with Sceneray Co., LTD, China.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      achievement: "First DBS in Nepal"
    },
    {
      year: "2018",
      title: "Neuronavigation",
      description: "Introduced Neuronavigation System in collaboration with Happy Reliable Surgical, India.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      achievement: "Advanced Surgical Tech"
    },
    {
      year: "2024",
      title: "3D Printing",
      description: "Manufacturing 3D printed customized bone implants and developing surgical tools locally.",
      icon: Award,
      color: "from-orange-500 to-red-500",
      achievement: "Innovation Leader"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Research & Innovation",
      description: "Local research and development of surgical tools with doctors and engineers.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Award,
      title: "Quality Supplies",
      description: "Providing quality equipment and supplies at affordable costs across Nepal.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Globe,
      title: "International Collaboration",
      description: "Partnering with global manufacturers to uplift healthcare services in Nepal.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Maintenance Services",
      description: "Comprehensive repair and maintenance services for medical devices.",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section id="company-story" ref={ref} className="py-12 bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300/30 rounded-full text-blue-600 text-sm font-medium backdrop-blur-sm mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            Our Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent mb-4">
            Transforming Healthcare Since 2015
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            From Deep Brain Stimulation to 3D printed implants, discover how we've pioneered 
            advanced healthcare solutions across Nepal.
          </p>
        </motion.div>

        {/* Main Story Section - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileInView={{ 
              scale: [0.95, 1],
              transition: { duration: 0.4 }
            }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-4">
              Pioneering Healthcare Excellence
            </h3>
            <div className="space-y-3 text-gray-700">
              <motion.p 
                className="text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Established in 2015 as a wing of Annapurna Neurological Institute & Allied Sciences, 
                we bring together doctors, engineers, and researchers to advance medical technology in Nepal.
              </motion.p>
              <motion.p 
                className="text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                We coordinate with national and international healthcare equipment manufacturers 
                to provide quality service at affordable costs across Nepal.
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
            whileInView={{ 
              scale: [0.95, 1],
              transition: { duration: 0.4 }
            }}
            viewport={{ once: true }}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 z-10" />
              <Image
                src="/assets/images/annapurna-staff-celebration.jpg"
                alt="Annapurna Neurological Institute Staff - 14th Anniversary Celebration"
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-20" />
              <div className="absolute bottom-4 left-4 z-30">
                <div className="text-white font-semibold text-base">Annapurna Neurological Institute</div>
                <div className="text-blue-200 text-xs">14th Anniversary Celebration - February 8th, 2023</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Interactive Timeline - Enhanced Animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 to-cyan-300 rounded-full hidden md:block" />
            
            <div className="space-y-8 md:space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2 + index * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                  onMouseEnter={() => setActiveTimeline(index)}
                  whileInView={{ 
                    scale: [0.9, 1],
                    transition: { duration: 0.3 }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {/* Timeline Node - Enhanced */}
                  <motion.div
                    className={`absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r ${milestone.color} flex items-center justify-center shadow-lg z-10 hidden md:flex`}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    animate={activeTimeline === index ? { 
                      scale: 1.2, 
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)" 
                    } : { scale: 1 }}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <milestone.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content - Enhanced Hover Effects */}
                  <motion.div
                    className={`w-full md:w-5/12 ${
                      index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                    } text-center`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-blue-200">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${milestone.color} mb-4 md:hidden`}>
                        <milestone.icon className="w-6 h-6 text-white" />
                      </div>
                      <motion.div 
                        className={`text-3xl font-bold bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent mb-2`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {milestone.year}
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{milestone.description}</p>
                      <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {milestone.achievement}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Compact Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3"
              whileInView={{ scale: [0.9, 1] }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              Our Core Values
            </motion.h3>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              These fundamental principles guide every decision we make and every solution we deliver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.8 + index * 0.08,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                  <motion.div 
                    className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 text-center group-hover:text-blue-600 transition-colors duration-300">
                    {value.title}
                  </h4>
                  <p className="text-sm text-gray-600 text-center leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
