import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* About header */}
            <div className="bg-gray-900 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">About Quantum Doodle</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* About content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">What is Quantum Doodle?</h3>
                <p className="text-gray-300 mb-4">
                  Quantum Doodle is an interactive web application that combines quantum computing concepts with a creative drawing interface. 
                  It allows you to create quantum circuit diagrams through intuitive drawing gestures, visualize quantum states, 
                  and see real-time quantum simulations of your drawings.
                </p>
                <p className="text-gray-300">
                  Whether you're a quantum computing expert or just getting started, Quantum Doodle provides a fun and 
                  accessible way to experiment with quantum circuits and understand their behavior.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Intuitive drawing interface for creating quantum circuits</li>
                  <li>Real-time quantum state visualization</li>
                  <li>Support for standard quantum gates (X, Y, Z, H, CNOT, etc.)</li>
                  <li>Export circuits as images or Qiskit code</li>
                  <li>Dark mode interface optimized for focus</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Technology</h3>
                <p className="text-gray-300">
                  Quantum Doodle is built with modern web technologies including React, Next.js, TypeScript, 
                  TailwindCSS, and Framer Motion. The quantum simulations are powered by the quantum-circuit library.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Credits</h3>
                <p className="text-gray-300">
                  Created with ❤️ by the Quantum Doodle team. Special thanks to the open-source quantum computing community.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default About; 