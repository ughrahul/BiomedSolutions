import { Heart, Shield, Zap, Users, Settings, Award } from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Patient Care Equipment",
    description:
      "Advanced monitoring and life support systems designed for optimal patient care and safety.",
    features: [
      "Vital Signs Monitoring",
      "Life Support Systems",
      "Patient Comfort",
    ],
  },
  {
    icon: Shield,
    title: "Safety & Compliance",
    description:
      "Equipment that meets the highest safety standards and regulatory compliance requirements.",
    features: ["FDA Approved", "ISO Certified", "Safety Protocols"],
  },
  {
    icon: Zap,
    title: "Advanced Technology",
    description:
      "Cutting-edge medical technology with AI integration and smart monitoring capabilities.",
    features: ["AI Integration", "Smart Monitoring", "Predictive Analytics"],
  },
  {
    icon: Users,
    title: "Training & Support",
    description:
      "Comprehensive training programs and 24/7 technical support for healthcare professionals.",
    features: ["On-site Training", "24/7 Support", "Expert Consultation"],
  },
  {
    icon: Settings,
    title: "Maintenance Services",
    description:
      "Preventive maintenance and repair services to ensure optimal equipment performance.",
    features: [
      "Preventive Maintenance",
      "Quick Repairs",
      "Performance Optimization",
    ],
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description:
      "Rigorous quality control processes to ensure reliability and performance excellence.",
    features: [
      "Quality Testing",
      "Performance Validation",
      "Reliability Assurance",
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
            Comprehensive medical equipment solutions designed to enhance
            healthcare delivery and improve patient outcomes through innovative
            technology and expert support.
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
            Ready to transform your healthcare facility with our advanced
            equipment?
          </p>
          <button className="button-primary">Get Started Today</button>
        </div>
      </div>
    </section>
  );
}
