'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaArrowRight, FaDrawPolygon, FaRegLightbulb } from 'react-icons/fa';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">How to Use Quantum Doodle</h2>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={onClose}
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-2 flex items-center">
                  <FaRegLightbulb className="mr-2" /> Getting Started
                </h3>
                <p className="mb-2">
                  Quantum Doodle lets you draw quantum circuits and instantly see their simulation results. 
                  Here's how to get started:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Select a quantum gate from the <strong>Tools Panel</strong> on the left</li>
                  <li>Click and drag on the canvas to place the gate on a qubit wire</li>
                  <li>Add more gates to build your quantum circuit</li>
                  <li>See the simulation results in the <strong>Quantum State</strong> panel on the right</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-2 flex items-center">
                  <FaDrawPolygon className="mr-2" /> Available Quantum Gates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">Wire</h4>
                    <p>Creates a qubit wire. Draw horizontal lines to add qubits to your circuit.</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">Hadamard (H)</h4>
                    <p>Creates superposition. Puts a qubit in an equal superposition of 0 and 1.</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">Pauli-X (X)</h4>
                    <p>Quantum NOT gate. Flips a qubit from 0 to 1 or 1 to 0.</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">Pauli-Z (Z)</h4>
                    <p>Phase flip. Adds a phase of -1 if the qubit is in state 1.</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">CNOT</h4>
                    <p>Controlled-NOT gate. Flips the target qubit if the control qubit is 1.</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium text-white">Measure</h4>
                    <p>Measurement gate. Measures a qubit, collapsing its quantum state.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-2 flex items-center">
                  <FaArrowRight className="mr-2" /> Step-by-Step Example
                </h3>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Create qubits:</strong> Select the "Wire" tool and draw 2-3 horizontal lines on the canvas, one above the other.
                  </li>
                  <li>
                    <strong>Add a Hadamard gate:</strong> Select the "Hadamard" tool and click on the top qubit wire.
                  </li>
                  <li>
                    <strong>Add a CNOT gate:</strong> Select the "CNOT" tool and click first on the top qubit (control) and then on the second qubit (target).
                  </li>
                  <li>
                    <strong>View the results:</strong> Look at the Quantum State panel to see that you've created an entangled state (Bell state).
                  </li>
                  <li>
                    <strong>Export your circuit:</strong> Use the Export panel to save your circuit as an image.
                  </li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-2">Understanding the Results</h3>
                <p className="mb-2">
                  The Quantum State panel shows:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>State Vector:</strong> The complex amplitudes of each basis state in your quantum circuit.</li>
                  <li><strong>Measurement Probabilities:</strong> The probability of measuring each possible outcome when the circuit is run.</li>
                </ul>
                <p className="mt-2">
                  For example, in a 2-qubit system, you'll see probabilities for |00⟩, |01⟩, |10⟩, and |11⟩.
                </p>
              </section>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Tip: Start with simple circuits and gradually build more complex ones as you get comfortable with the interface.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tutorial; 