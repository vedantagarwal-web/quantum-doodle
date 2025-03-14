import React from 'react';
import { motion } from 'framer-motion';
import { QuantumCircuit } from '../lib/CircuitRecognizer';
import { CanvasManagerHandle } from './CanvasManager';

interface ExportPanelProps {
  circuit: QuantumCircuit | null;
  canvasRef: React.RefObject<CanvasManagerHandle>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ circuit, canvasRef }) => {
  const exportAsPNG = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.getCanvasElement();
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'quantum-circuit.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportAsSVG = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.getCanvasElement();
    if (!canvas) return;
    
    // This is a simplified SVG export - in a real app, you'd want to convert the canvas content to SVG paths
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const svgData = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <img src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}" />
          </div>
        </foreignObject>
      </svg>
    `;
    
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'quantum-circuit.svg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const generateQiskitCode = () => {
    if (!circuit) return '';
    
    let code = 'from qiskit import QuantumCircuit, Aer, execute\n\n';
    code += `# Create a Quantum Circuit with ${circuit.qubits} qubits\n`;
    code += `qc = QuantumCircuit(${circuit.qubits})\n\n`;
    
    // Sort gates by x position to apply them in order
    const sortedGates = [...circuit.gates].sort((a, b) => a.position.x - b.position.x);
    
    // Add gates to the circuit
    sortedGates.forEach(gate => {
      switch (gate.type) {
        case 'hadamard':
          code += `qc.h(${gate.targets[0]})  # Hadamard gate\n`;
          break;
        case 'pauliX':
          code += `qc.x(${gate.targets[0]})  # Pauli-X (NOT) gate\n`;
          break;
        case 'pauliY':
          code += `qc.y(${gate.targets[0]})  # Pauli-Y gate\n`;
          break;
        case 'pauliZ':
          code += `qc.z(${gate.targets[0]})  # Pauli-Z gate\n`;
          break;
        case 'cnot':
          if (gate.controls && gate.controls.length > 0) {
            code += `qc.cx(${gate.controls[0]}, ${gate.targets[0]})  # CNOT gate\n`;
          }
          break;
        case 'measure':
          code += `qc.measure_all()  # Measure all qubits\n`;
          break;
      }
    });
    
    code += '\n# Run the circuit on a simulator\n';
    code += 'simulator = Aer.get_backend("qasm_simulator")\n';
    code += 'job = execute(qc, simulator, shots=1000)\n';
    code += 'result = job.result()\n';
    code += 'counts = result.get_counts(qc)\n';
    code += 'print("Results:", counts)\n';
    
    return code;
  };
  
  const copyQiskitCode = () => {
    const code = generateQiskitCode();
    navigator.clipboard.writeText(code);
    alert('Qiskit code copied to clipboard!');
  };
  
  const generateShareableLink = () => {
    if (!circuit) return;
    
    // In a real app, you'd want to store the circuit data on a server
    // and generate a unique URL. This is a simplified example.
    const circuitData = JSON.stringify(circuit);
    const encodedData = encodeURIComponent(circuitData);
    const url = `${window.location.origin}?circuit=${encodedData}`;
    
    navigator.clipboard.writeText(url);
    alert('Shareable link copied to clipboard!');
  };

  return (
    <motion.div
      className="export-panel p-4 bg-gray-800 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-white mb-3">Export Options</h3>
      
      <div className="space-y-2">
        <button
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
          onClick={exportAsPNG}
          disabled={!circuit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Export as PNG
        </button>
        
        <button
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
          onClick={exportAsSVG}
          disabled={!circuit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export as SVG
        </button>
        
        <button
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center"
          onClick={copyQiskitCode}
          disabled={!circuit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Show Qiskit Code
        </button>
        
        <button
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors flex items-center justify-center"
          onClick={generateShareableLink}
          disabled={!circuit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Generate Shareable Link
        </button>
      </div>
      
      {!circuit && (
        <div className="mt-3 text-center text-gray-400 text-sm">
          Draw a quantum circuit to enable export options
        </div>
      )}
    </motion.div>
  );
};

export default ExportPanel; 