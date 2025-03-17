import { motion } from 'framer-motion';
import { ArrowRightIcon, ChartBarIcon, CloudIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { images } from '../constants/images';

const features = [
  {
    title: 'Real-time Market Prices',
    description: 'Stay updated with current agricultural market prices to make informed decisions about your produce.',
    icon: ChartBarIcon,
    image: images.market
  },
  {
    title: 'Weather Forecasts',
    description: 'Access detailed weather forecasts to plan your farming activities effectively.',
    icon: CloudIcon,
    image: images.cultivation
  },
  {
    title: 'Expert Supervision',
    description: 'Connect with agricultural experts for guidance and support in your farming journey.',
    icon: UserGroupIcon,
    image: images.experts
  },
];

const stats = [
  { value: '10K+', label: 'Active Farmers' },
  { value: '24/7', label: 'Support Available' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Expert Advisors' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${images.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/90 z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Smart Farming Solutions
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto"
            >
              Connect with supervisors, track market prices, and get weather updates all in one place
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.a
                href="#features"
                className="inline-flex items-center btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.p 
                  className="text-3xl md:text-4xl font-bold text-primary"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Agromate?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides essential tools and information to help you maximize your farming potential
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <motion.div 
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${images.cultivation})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-primary-dark/90 z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already benefiting from our smart farming solutions
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/register" className="btn-secondary">
                Join Agromate Today
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}