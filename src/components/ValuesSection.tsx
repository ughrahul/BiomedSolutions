import { Heart, Shield, Zap, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Patient-Centered",
    description:
      "Every innovation we create is designed with patient care and safety as the top priority.",
  },
  {
    icon: Shield,
    title: "Quality & Safety",
    description:
      "We maintain the highest standards of quality and safety in all our products and services.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We continuously push the boundaries of medical technology to improve healthcare outcomes.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "We work closely with healthcare professionals to understand and meet their needs.",
  },
];

export default function ValuesSection() {
  return (
    <section className="section-padding bg-secondary-800">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            Our <span className="gradient-text">Values</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            The principles that guide everything we do and every product we
            create.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="glass rounded-xl p-6 text-center card-hover group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                {value.title}
              </h3>

              <p className="text-secondary-300 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
