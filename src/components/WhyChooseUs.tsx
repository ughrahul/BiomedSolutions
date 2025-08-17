import { CheckCircle, Award, Shield, Clock, Users, Zap } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Industry Leader",
    description:
      "15+ years of experience in medical technology with proven track record of innovation.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "All products meet FDA standards and undergo rigorous quality control processes.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock technical support and emergency assistance for all our equipment.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description:
      "Dedicated team of engineers, medical professionals, and support specialists.",
  },
  {
    icon: Zap,
    title: "Latest Technology",
    description:
      "Cutting-edge innovations with AI integration and smart monitoring capabilities.",
  },
  {
    icon: CheckCircle,
    title: "Proven Results",
    description:
      "99% customer satisfaction rate with measurable improvements in patient outcomes.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-secondary-800">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            Why Choose <span className="gradient-text">Biomed Solutions</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Discover what sets us apart in the medical equipment industry and
            why healthcare facilities worldwide trust our solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="glass rounded-xl p-6 card-hover group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <reason.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                {reason.title}
              </h3>

              <p className="text-secondary-300 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-secondary-300 mb-6">
            Ready to experience the difference that quality and innovation make?
          </p>
          <button className="button-primary">Get Started Today</button>
        </div>
      </div>
    </section>
  );
}
