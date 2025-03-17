import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const contactInfo = [
  {
    icon: PhoneIcon,
    title: "Phone",
    details: "+1 234 567 890",
    description: "Monday to Friday, 9am to 6pm"
  },
  {
    icon: EnvelopeIcon,
    title: "Email",
    details: "support@agromate.com",
    description: "We'll respond within 24 hours"
  },
  {
    icon: MapPinIcon,
    title: "Office",
    details: "123 Farming Street",
    description: "New York, NY 10001"
  }
];

export default function Contact() {
  const [formStatus, setFormStatus] = useState({ submitted: false, submitting: false });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, submitting: true });
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFormStatus({ submitted: true, submitting: false });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-primary text-white py-20 relative overflow-hidden"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-center max-w-2xl mx-auto text-gray-100">
            Have questions about Agromate? We're here to help you grow your farming business.
          </p>
        </motion.div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0L100 100V0H0Z" fill="currentColor" />
          </svg>
        </div>
      </motion.section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-primary font-medium mb-1">{item.details}</p>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {formStatus.submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircleIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formStatus.submitting}
                  className={`w-full btn-primary ${formStatus.submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {formStatus.submitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}