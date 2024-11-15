import React, { useState } from 'react';
import { 
  Shield, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Plane, 
  Users, 
  ShoppingBag, 
  Music, 
  Share2,
  ChevronRight,
  CheckCircle,
  Send,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const services: Service[] = [
  {
    id: 'government',
    icon: <Building2 className="w-12 h-12 text-cyan-400" />,
    title: 'Government Services',
    description: 'Streamline public service delivery and reduce fraud with secure digital identification.',
    benefits: [
      'Efficient social services delivery',
      'Secure voting systems',
      'Simplified tax collection',
      'Reduced identity fraud'
    ]
  },
  {
    id: 'healthcare',
    icon: <Heart className="w-12 h-12 text-cyan-400" />,
    title: 'Healthcare',
    description: 'Enable secure patient identification and streamlined healthcare access.',
    benefits: [
      'Accurate medical records',
      'Secure telehealth services',
      'Cross-border healthcare access',
      'Simplified insurance claims'
    ]
  },
  {
    id: 'education',
    icon: <GraduationCap className="w-12 h-12 text-cyan-400" />,
    title: 'Education',
    description: 'Verify academic credentials and secure student records globally.',
    benefits: [
      'Verified academic records',
      'Secure exam proctoring',
      'Global credential verification',
      'Simplified enrollment'
    ]
  },
  {
    id: 'business',
    icon: <Briefcase className="w-12 h-12 text-cyan-400" />,
    title: 'Business & Employment',
    description: 'Streamline employee verification and secure access control.',
    benefits: [
      'Secure remote onboarding',
      'Simplified HR processes',
      'Access control management',
      'Employee credential verification'
    ]
  },
  {
    id: 'travel',
    icon: <Plane className="w-12 h-12 text-cyan-400" />,
    title: 'Travel & Hospitality',
    description: 'Expedite travel processes and enhance security measures.',
    benefits: [
      'Faster airport security',
      'Simplified border crossings',
      'Quick hotel check-ins',
      'Secure travel documentation'
    ]
  },
  {
    id: 'social',
    icon: <Users className="w-12 h-12 text-cyan-400" />,
    title: 'Social Services',
    description: 'Provide secure access to humanitarian aid and social support.',
    benefits: [
      'Aid distribution tracking',
      'Refugee identification',
      'Service access management',
      'Benefit distribution'
    ]
  },
  {
    id: 'retail',
    icon: <ShoppingBag className="w-12 h-12 text-cyan-400" />,
    title: 'Retail & E-commerce',
    description: 'Enhance customer verification and secure transactions.',
    benefits: [
      'Secure customer verification',
      'Fraud prevention',
      'Age verification',
      'Loyalty program integration'
    ]
  },
  {
    id: 'entertainment',
    icon: <Music className="w-12 h-12 text-cyan-400" />,
    title: 'Entertainment & Media',
    description: 'Secure content access and age-appropriate restrictions.',
    benefits: [
      'Content access control',
      'Age verification',
      'Digital rights management',
      'Subscription management'
    ]
  }
];

const About = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry: ''
  });
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormStatus({ type: null, message: '' });

    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendContactEmail');
      await sendEmail(formData);

      setFormStatus({
        type: 'success',
        message: 'Thank you for your message! We\'ll get back to you soon.'
      });
      setFormData({ name: '', email: '', inquiry: '' });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Transforming Digital Identity
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Our platform provides secure, verifiable digital identities for various sectors,
            enabling trusted interactions in our increasingly digital world.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800/50 rounded-lg border border-gray-700 p-6 cursor-pointer
                hover:border-cyan-500/50 transition-colors
                ${selectedService?.id === service.id ? 'border-cyan-500' : ''}
              `}
              onClick={() => setSelectedService(service)}
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <button
                className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                onClick={() => setSelectedService(service)}
              >
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          ))}
        </div>

        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl border border-cyan-500/30 p-8 mb-16"
          >
            <div className="flex items-start gap-6">
              <div className="hidden md:block">{selectedService.icon}</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">{selectedService.title}</h2>
                <p className="text-gray-300 mb-6">{selectedService.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-gray-300 mt-2">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-cyan-500/30 p-8">
            {formStatus.type && (
              <div className={`flex items-center gap-2 mb-6 p-4 rounded-lg ${
                formStatus.type === 'success' 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {formStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm">{formStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="inquiry" className="block text-sm font-medium text-gray-300 mb-2">
                  What are you inquiring about?
                </label>
                <textarea
                  id="inquiry"
                  required
                  value={formData.inquiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, inquiry: e.target.value }))}
                  className="input-field min-h-[120px]"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;