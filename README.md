# Quantum Doodle

Quantum Doodle is an interactive web application that combines quantum computing concepts with a creative drawing interface. It allows users to create quantum circuit diagrams through intuitive drawing gestures, visualize quantum states, and see real-time quantum simulations of their drawings.

## Features

- **Canvas Drawing Interface**: Full-screen HTML5 Canvas drawing interface with smooth, responsive drawing and customizable tools
- **Quantum Circuit Recognition**: Converts freehand drawings into proper quantum circuit elements
- **Quantum Simulation Engine**: Real-time quantum state visualization and probability calculation
- **Modern UI**: Minimalist, intuitive interface with dark mode and responsive design
- **Export & Sharing**: Export circuits as images or Qiskit code

## Tech Stack

- **Frontend**: React.js, Next.js, TypeScript, TailwindCSS, Framer Motion
- **Quantum Processing**: quantum-circuit library for simulations
- **Canvas API**: For drawing functionality

## Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm (v9.6.7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quantum-doodle.git
   cd quantum-doodle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Drawing Quantum Wires**: Select the Wire tool from the left panel and draw horizontal lines to create quantum wires.
2. **Adding Quantum Gates**: Select a gate (like Hadamard or Pauli-X) and place it on a wire.
3. **Creating Multi-Qubit Gates**: For gates like CNOT, select the tool and then click on the control qubit followed by the target qubit.
4. **Viewing Quantum States**: The quantum simulator at the bottom shows the state vector and measurement probabilities in real-time.
5. **Exporting**: Use the export panel on the right to save your circuit as an image or generate Qiskit code.

## Project Structure

```
quantum-doodle/
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   │   ├── CanvasManager.tsx # Main drawing interface
│   │   ├── ToolPanel.tsx     # Quantum gate selection tools
│   │   ├── QuantumSimulator.tsx # Quantum state visualization
│   │   ├── ExportPanel.tsx   # Export and sharing functionality
│   │   ├── Tutorial.tsx      # Interactive tutorial
│   │   └── About.tsx         # About information
│   ├── lib/                  # Utility functions
│   │   └── CircuitRecognizer.ts # Converts drawings to quantum circuits
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## Future Enhancements

- Custom quantum gate creation
- Multiple circuit tabs/workspaces
- Circuit optimization suggestions
- Quantum algorithm templates (Grover's, Shor's, etc.)
- Real quantum hardware execution via cloud APIs
- Collaborative editing with multiple users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the quantum-circuit library for providing quantum simulation capabilities
- Inspired by the growing field of quantum computing education and visualization tools
