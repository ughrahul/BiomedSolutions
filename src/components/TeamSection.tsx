import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";

const team = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Executive Officer",
    image: "/assets/images/logo.png",
    bio: "Leading our mission to advance medical technology with over 20 years of healthcare experience.",
    email: "sarah.johnson@biomedsolutions.com",
    linkedin: "#",
  },
  {
    name: "Dr. Michael Chen",
    role: "Chief Technology Officer",
    image: "/assets/images/logo.png",
    bio: "Pioneering innovative medical technologies with expertise in AI and robotics.",
    email: "michael.chen@biomedsolutions.com",
    linkedin: "#",
  },
  {
    name: "Emily Rodriguez",
    role: "Chief Operations Officer",
    image: "/assets/images/logo.png",
    bio: "Ensuring operational excellence and customer satisfaction across all our services.",
    email: "emily.rodriguez@biomedsolutions.com",
    linkedin: "#",
  },
];

export default function TeamSection() {
  return (
    <section className="section-padding bg-secondary-900">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            Our <span className="gradient-text">Leadership</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Meet the visionary leaders driving innovation in medical technology
            and transforming healthcare delivery worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="glass rounded-xl overflow-hidden card-hover group"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {member.name}
                </h3>

                <p className="text-primary-400 font-medium mb-4">
                  {member.role}
                </p>

                <p className="text-secondary-300 mb-6 leading-relaxed">
                  {member.bio}
                </p>

                <div className="flex space-x-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-300"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-300"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
