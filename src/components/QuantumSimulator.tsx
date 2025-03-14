'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QuantumCircuit as CircuitType } from '../lib/CircuitRecognizer';

interface Complex {
  re: number;
  im: number;
}

interface QuantumSimulatorProps {
  circuit: CircuitType | null;
}

// Simple quantum simulator implementation
class SimpleQuantumSimulator {
  private numQubits: number;
  private stateVector: Complex[];

  constructor(numQubits: number) {
    this.numQubits = numQubits;
    this.stateVector = new Array(Math.pow(2, numQubits)).fill(null).map(() => ({ re: 0, im: 0 }));
    // Initialize to |0...0⟩ state
    this.stateVector[0] = { re: 1, im: 0 };
  }

  // Apply Hadamard gate to a qubit
  applyHadamard(qubit: number): void {
    const newStateVector: Complex[] = new Array(this.stateVector.length).fill(null).map(() => ({ re: 0, im: 0 }));
    const factor = 1 / Math.sqrt(2);
    
    for (let i = 0; i < this.stateVector.length; i++) {
      const bitValue = (i >> qubit) & 1;
      const targetIndex1 = i;
      const targetIndex2 = i ^ (1 << qubit); // Flip the qubit bit
      
      if (bitValue === 0) {
        // |0⟩ -> (|0⟩ + |1⟩)/√2
        newStateVector[targetIndex1].re += factor * this.stateVector[i].re;
        newStateVector[targetIndex1].im += factor * this.stateVector[i].im;
        newStateVector[targetIndex2].re += factor * this.stateVector[i].re;
        newStateVector[targetIndex2].im += factor * this.stateVector[i].im;
      } else {
        // |1⟩ -> (|0⟩ - |1⟩)/√2
        newStateVector[targetIndex1].re += factor * this.stateVector[i].re;
        newStateVector[targetIndex1].im += factor * this.stateVector[i].im;
        newStateVector[targetIndex2].re -= factor * this.stateVector[i].re;
        newStateVector[targetIndex2].im -= factor * this.stateVector[i].im;
      }
    }
    
    this.stateVector = newStateVector;
  }

  // Apply Pauli X (NOT) gate to a qubit
  applyPauliX(qubit: number): void {
    const newStateVector: Complex[] = new Array(this.stateVector.length).fill(null).map(() => ({ re: 0, im: 0 }));
    
    for (let i = 0; i < this.stateVector.length; i++) {
      const targetIndex = i ^ (1 << qubit); // Flip the qubit bit
      newStateVector[targetIndex].re = this.stateVector[i].re;
      newStateVector[targetIndex].im = this.stateVector[i].im;
    }
    
    this.stateVector = newStateVector;
  }

  // Apply Pauli Z gate to a qubit
  applyPauliZ(qubit: number): void {
    for (let i = 0; i < this.stateVector.length; i++) {
      const bitValue = (i >> qubit) & 1;
      if (bitValue === 1) {
        // If qubit is |1⟩, multiply by -1
        this.stateVector[i].re = -this.stateVector[i].re;
        this.stateVector[i].im = -this.stateVector[i].im;
      }
    }
  }

  // Apply CNOT gate
  applyCNOT(control: number, target: number): void {
    const newStateVector: Complex[] = new Array(this.stateVector.length).fill(null).map(() => ({ re: 0, im: 0 }));
    
    for (let i = 0; i < this.stateVector.length; i++) {
      const controlBit = (i >> control) & 1;
      if (controlBit === 1) {
        // If control qubit is |1⟩, flip the target qubit
        const targetIndex = i ^ (1 << target);
        newStateVector[targetIndex].re = this.stateVector[i].re;
        newStateVector[targetIndex].im = this.stateVector[i].im;
      } else {
        // If control qubit is |0⟩, do nothing
        newStateVector[i].re = this.stateVector[i].re;
        newStateVector[i].im = this.stateVector[i].im;
      }
    }
    
    this.stateVector = newStateVector;
  }

  // Get the state vector
  getStateVector(): Complex[] {
    return this.stateVector;
  }

  // Get the probabilities
  getProbabilities(): number[] {
    return this.stateVector.map(state => (state.re * state.re) + (state.im * state.im));
  }
}

const QuantumSimulator: React.FC<QuantumSimulatorProps> = ({ circuit }) => {
  const [stateVector, setStateVector] = useState<Complex[]>([]);
  const [probabilities, setProbabilities] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'state' | 'probs'>('probs');
  const [showExplanation, setShowExplanation] = useState(false);

  // Run simulation when circuit changes
  useEffect(() => {
    if (!circuit) return;

    setIsSimulating(true);
    setError(null);

    try {
      // Create a new quantum circuit simulator
      const simulator = new SimpleQuantumSimulator(circuit.qubits);
      
      // Sort gates by x position to apply them in order
      const sortedGates = [...circuit.gates].sort((a, b) => a.position.x - b.position.x);
      
      // Apply gates to the circuit
      sortedGates.forEach(gate => {
        switch (gate.type) {
          case 'hadamard':
            simulator.applyHadamard(gate.targets[0]);
            break;
          case 'pauliX':
            simulator.applyPauliX(gate.targets[0]);
            break;
          case 'pauliY':
            // Pauli Y is not implemented in this simple simulator
            // For a real implementation, we would add applyPauliY method
            break;
          case 'pauliZ':
            simulator.applyPauliZ(gate.targets[0]);
            break;
          case 'cnot':
            if (gate.controls && gate.controls.length > 0) {
              simulator.applyCNOT(gate.controls[0], gate.targets[0]);
              console.log(`Applying CNOT: control=${gate.controls[0]}, target=${gate.targets[0]}`);
            } else {
              console.log('CNOT gate missing control qubit');
            }
            break;
          case 'measure':
            // Measurement is not implemented in this simple simulator
            // In a real quantum computer, this would collapse the state
            break;
          default:
            break;
        }
      });

      // Get the state vector and probabilities
      const stateVec = simulator.getStateVector();
      setStateVector(stateVec);
      setProbabilities(simulator.getProbabilities());
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to simulate quantum circuit');
    } finally {
      setIsSimulating(false);
    }
  }, [circuit]);

  if (!circuit) {
    return (
      <div className="quantum-simulator p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-blue-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-400">Draw a quantum circuit to see the simulation</p>
            <p className="text-gray-500 text-sm mt-2">Start with the Wire tool to create qubit lines</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSimulating) {
    return (
      <div className="quantum-simulator p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-400">Simulating quantum circuit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quantum-simulator p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-40 text-center">
          <div>
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Try simplifying your circuit or check for errors</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="quantum-simulator p-4 bg-gray-800 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Quantum State</h3>
        <div className="flex items-center">
          <button 
            className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showExplanation ? 'Hide Help' : 'What is this?'}
          </button>
        </div>
      </div>
      
      {showExplanation && (
        <motion.div 
          className="bg-gray-700 p-3 rounded-lg mb-4 text-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-gray-300 mb-2">
            This panel shows the quantum state of your circuit:
          </p>
          <ul className="list-disc pl-4 text-gray-300 space-y-1">
            <li><strong>State Vector</strong>: The complex amplitudes of each basis state</li>
            <li><strong>Probabilities</strong>: The chance of measuring each outcome</li>
          </ul>
          <p className="text-gray-400 text-xs mt-2">
            For example, in a 2-qubit system, |00⟩ means both qubits are in state 0.
          </p>
        </motion.div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-3">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'probs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('probs')}
        >
          Probabilities
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'state' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('state')}
        >
          State Vector
        </button>
      </div>
      
      {activeTab === 'state' ? (
        /* State Vector Visualization */
        <div className="state-vector">
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
            {stateVector.map((state, idx) => (
              <div key={idx} className="flex items-center bg-gray-700 p-2 rounded-lg">
                <div className="w-16 text-center bg-gray-800 rounded-md py-1 mr-3">
                  <span className="text-xs text-gray-300">|{idx.toString(2).padStart(circuit.qubits, '0')}⟩</span>
                </div>
                <span className="text-sm text-white flex-1">
                  {state.re.toFixed(2)}
                  {state.im >= 0 ? ' + ' : ' - '}
                  {Math.abs(state.im).toFixed(2)}i
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Probability Visualization */
        <div className="probabilities">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {probabilities.map((prob, idx) => {
              // Find the highest probability for highlighting
              const isHighest = prob === Math.max(...probabilities);
              
              return (
                <div key={idx} className={`flex flex-col ${isHighest ? 'bg-gray-700' : ''} p-2 rounded-lg`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-300 mr-2">|{idx.toString(2).padStart(circuit.qubits, '0')}⟩:</span>
                      <span className="text-sm text-white">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    {isHighest && <span className="text-xs text-blue-400">Most likely</span>}
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div 
                      className={`h-full ${isHighest ? 'bg-blue-500' : 'bg-blue-700'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${prob * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Circuit Summary */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{circuit.qubits + 1} qubit{circuit.qubits !== 1 ? 's' : ''}</span>
          <span>{circuit.gates.length + 1} gate{circuit.gates.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumSimulator; 