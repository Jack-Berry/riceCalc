import { useState } from "react";
import "./App.css";

function App() {
  const [uncooked, setUncooked] = useState("");
  const [cooked, setCooked] = useState("");
  const [water, setWater] = useState("");
  const yieldRatio = 2; // your tested ratio

  const handleUncookedChange = (e) => {
    const value = e.target.value;
    setUncooked(value);
    setCooked(value * yieldRatio);
    setWater(value); // adjust based on your desired ratio
  };

  const handleCookedChange = (e) => {
    const value = e.target.value;
    setCooked(value);
    setUncooked(value / yieldRatio);
    setWater(value / yieldRatio); // adjust water calculation accordingly
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Rice Cooker Calculator</h1>
      <div>
        <label>Uncooked</label>
        <br />
        <input
          type="number"
          value={uncooked}
          onChange={handleUncookedChange}
        />{" "}
        g
      </div>
      <div style={{ margin: "20px" }}>
        <label>Cooked</label>
        <br />
        <input type="number" value={cooked} onChange={handleCookedChange} /> g
      </div>
      <div style={{ margin: "20px" }}>
        <label>Water</label>
        <br />
        <input type="number" value={water} readOnly /> ml
      </div>
    </div>
  );
}

export default App;
