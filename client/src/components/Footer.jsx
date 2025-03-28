import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function Footer() {
  return (
    <motion.footer 
      className="bg-gray-900 text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-xl font-bold mb-4"
              whileHover={{ x: 5 }}
            >
              Agromate
            </motion.h3>
            <p className="text-gray-400">
              Empowering farmers with smart solutions for better agriculture.
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.h4 
              className="text-lg font-semibold mb-4"
              whileHover={{ x: 5 }}
            >
              Quick Links
            </motion.h4>
            <ul className="space-y-2">
              {[
                { to: "/market", text: "Market Prices" },
                { to: "/weather", text: "Weather Forecast" },
                { to: "/contact", text: "Contact Us" }
              ].map((link) => (
                <motion.li 
                  key={link.to}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.text}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.h4 
              className="text-lg font-semibold mb-4"
              whileHover={{ x: 5 }}
            >
              Contact
            </motion.h4>
            <ul className="space-y-2">
              {[
                "Email: info@agromate.com",
                "Phone: +1 234 567 890",
                "Address: 123 Farming Street"
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  className="text-gray-400"
                  whileHover={{ x: 5 }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
        <motion.div 
          variants={itemVariants}
          className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} Agromate. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}