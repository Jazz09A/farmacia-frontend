import React from 'react';
import { motion } from 'framer-motion';

export const StatsSection: React.FC = () => {
  const stats = [
    { number: '500+', label: 'Productos Certificados' },
    { number: '50+', label: 'Marcas Asociadas' },
    { number: '10k+', label: 'Clientes Satisfechos' },
    { number: '24/7', label: 'Atención Médica' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-medical-blue-50 to-medical-green-50">
      <div className="medical-container">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl lg:text-5xl font-bold text-medical-blue-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.div>
              <motion.p
                className="text-lg font-medium text-gray-700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
