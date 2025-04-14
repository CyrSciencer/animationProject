import React from "react";
import ThreeScene from "./components/ThreeScene"; // We will create this next
import "./style.css"; // Ensure styles are applied

function App() {
  return (
    <div className="App">
      {/* You could add other React components here if needed */}
      <ThreeScene modelColor="#000000" />
      <ThreeScene modelColor="#4f284b" />
      <ThreeScene modelColor="#3f3f3f" />
      <ThreeScene modelColor="#000fff" />
    </div>
  );
}

export default App;
