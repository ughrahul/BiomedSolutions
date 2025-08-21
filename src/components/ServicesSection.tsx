import { Brain, Navigation, Printer, Wrench, Package, Award } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "Deep Brain Stimulation",
    description:
      "Leading the introduction and implementation of DBS systems in Nepal in collaboration with Sceneray Co., LTD, China.",
    features: [
      "DBS System Installation",
      "Surgical Support",
      "Post-operative Care",
    ],
  },
  {
    icon: Navigation,
    title: "Neuronavigation Systems",
    description:
      "Advanced neuronavigation technology for precise surgical procedures in collaboration with Happy Reliable Surgical, India.",
    features: ["Surgical Navigation", "Precision Guidance", "Real-time Imaging"],
  },
  {
    icon: Printer,
    title: "3D Printed Implants",
    description:
      "Manufacturing customized bone implants using cutting-edge 3D printing technology for personalized patient care.",
    features: [
      "Customized Implants",
      "3D Printing Technology",
      "Patient-specific Solutions",
    ],
  },
  {
    icon: Wrench,
    title: "Research & Development",
    description:
      "Local research and development of surgical tools with a team of doctors and engineers focused on innovation.",
    features: ["Surgical Tool Development", "Medical Device Innovation", "Local Manufacturing"],
  },
  {
    icon: Package,
    title: "Medical Equipment Supply",
    description:
      "Import and supply of medical tools and devices across Nepal at affordable costs for healthcare institutions.",
    features: [
      "Equipment Import",
      "Nationwide Supply",
      "Affordable Solutions",
    ],
  },
  {
    icon: Award,
    title: "Maintenance Services",
    description:
      "Comprehensive repair and maintenance services for medical devices ensuring optimal performance and longevity.",
    features: [
      "Device Repair",
      "Preventive Maintenance",
      "Technical Support",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section className="section-padding bg-secondary-800">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            From pioneering Deep Brain Stimulation to manufacturing 3D printed implants, 
            we deliver cutting-edge healthcare solutions across Nepal through research, 
            innovation, and international partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="glass rounded-xl p-6 card-hover group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                {service.title}
              </h3>

              <p className="text-secondary-300 mb-6 leading-relaxed">
                {service.description}
              </p>

              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center text-sm text-secondary-300"
                  >
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-secondary-300 mb-6">
            Ready to explore innovative healthcare solutions for your medical facility?
          </p>
          <button className="button-primary">Get Started Today</button>
        </div>
      </div>
    </section>
  );
}
