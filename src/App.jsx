import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import gsap from "gsap";
import bowlEmpty from "./assets/rice_bowl_empty.png";
import bowlLow from "./assets/rice_bowl_low.png";
import bowlMedium from "./assets/rice_bowl_medium.png";
import bowlHigh from "./assets/rice_bowl_high.png";

import "./App.scss";

function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uncooked, setUncooked] = useState("");
  const [cooked, setCooked] = useState("");
  const [texture, setTexture] = useState(50); // 0 = firm, 100 = soft
  const [viewMode, setViewMode] = useState("grams");
  const [portionCount, setPortionCount] = useState("");
  const [portionSize, setPortionSize] = useState("medium");
  const [showSteam, setShowSteam] = useState(false);

  const defaultSettings = {
    yieldRatio: 1.96,
    portionSizes: {
      small: 150,
      medium: 200,
      large: 250,
    },
  };
  const [settings, setSettings] = useState(defaultSettings);
  const steamRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("riceSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (uncooked > 0) {
      setShowSteam(true);
      const timer = setTimeout(() => {
        setShowSteam(false);
      }, 120000);
    } else {
      setShowSteam(false);
    }
  }, [uncooked]);

  useEffect(() => {
    if (
      viewMode === "portions" &&
      portionCount !== "" &&
      !isNaN(portionCount)
    ) {
      const portionSizeMap = settings.portionSizes;
      const size = portionSizeMap[portionSize];
      const cookedValue = portionCount * size;
      setCooked(cookedValue);
      setUncooked(Math.round(cookedValue / settings.yieldRatio));
    }
  }, [portionCount, portionSize, viewMode, settings.yieldRatio]);

  useEffect(() => {
    if (!steamRef.current) return;

    const steams = steamRef.current.querySelectorAll(".steam");

    gsap.fromTo(
      steams,
      {
        y: 10,
        opacity: 0,
        scaleY: 0.8,
      },
      {
        y: -20,
        opacity: 1,
        scaleY: 1,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          repeat: -1,
          yoyo: true,
        },
      }
    );
  }, [uncooked, cooked, texture]);

  const getBowlImage = (cookedAmount) => {
    if (!cookedAmount || cookedAmount < 100) {
      return bowlEmpty;
    } else if (cookedAmount < 450) {
      return bowlLow;
    } else if (cookedAmount < 1000) {
      return bowlMedium;
    } else if (cookedAmount < 1600) {
      return bowlHigh;
    } else {
      return bowlEmpty;
    }
  };

  const handleUncookedChange = (e) => {
    const value = e.target.value;
    setUncooked(value);
    setCooked(value * settings.yieldRatio);
  };

  const handleCookedChange = (e) => {
    const value = e.target.value;
    const uncookedValue = Math.round(value / settings.yieldRatio);
    setCooked(value);
    setUncooked(uncookedValue);
  };

  const handleTextureChange = (e) => {
    const value = e.target.value;
    setTexture(value);
  };

  const updateWater = (riceAmount, textureValue) => {
    // Adjust water based on texture slider:
    // Example: base ratio = 1:1.3, scaled ±10% depending on texture
    const baseRatio = 1.3;
    const adjustment = (textureValue - 50) / 500; // ±10% max
    const finalRatio = baseRatio * (1 + adjustment);
    const calculation = (riceAmount * finalRatio).toFixed(0);
    return Math.round(calculation / 10) * 10; // rounded ml
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleYieldRatioChange = (e) => {
    const newYield = parseFloat(e.target.value);
    const updated = { ...settings, yieldRatio: newYield };
    setSettings(updated);
    localStorage.setItem("riceSettings", JSON.stringify(updated));
  };

  const handlePortionSizeChange = (sizeKey, value) => {
    const updatedSizes = {
      ...settings.portionSizes,
      [sizeKey]: parseInt(value),
    };
    const updatedSettings = {
      ...settings,
      portionSizes: updatedSizes,
    };
    setSettings(updatedSettings);
    localStorage.setItem("riceSettings", JSON.stringify(updatedSettings));
  };

  const handleYieldChange = (e) => {
    const uncookedValue = parseInt(
      document.getElementById("uncookedInput").value
    );
    const cookedValue = parseInt(document.getElementById("cookedInput").value);
    if (uncookedValue && cookedValue) {
      const newYieldRatio = cookedValue / uncookedValue;
      setSettings((prev) => ({
        ...prev,
        yieldRatio: newYieldRatio,
      }));
    }
  };

  return (
    <div
      className="main-container"
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <header className="App-header">
        <h1>Rice Cooker Calculator</h1>
        <button onClick={toggleDropdown}>
          <FontAwesomeIcon icon={faCog} />
        </button>
        {dropdownOpen && (
          <div className="backdrop" onClick={toggleDropdown}></div>
        )}

        <div
          className="dropdown"
          style={{ display: dropdownOpen ? "block" : "none" }}
        >
          <h2>Settings</h2>
          <hr />
          <h4>Yield Ratio Calculator</h4>
          <p>
            If the cooked amount did not match the calculators suggested amount,
            you can use this calculator to set the correct yield ratio for your
            appliance.
          </p>
          <div className="yield-calc">
            <label htmlFor="uncookedInput">Uncooked (g):</label>
            <input
              type="number"
              id="uncookedInput"
              onChange={handleYieldChange}
            />
            <label htmlFor="cookedInput">Cooked (g):</label>
            <input
              type="number"
              id="cookedInput"
              onChange={handleYieldChange}
            />
          </div>
          {/* <p>Yield Ratio: {yieldCalc} </p> */}
          <div className="yield-ratio">
            <label htmlFor="yieldRatio">Yield Ratio:</label>
            <input
              type="number"
              id="yieldRatio"
              value={settings.yieldRatio}
              onChange={handleYieldRatioChange}
            />
          </div>

          <hr />

          <h4>Portion Sizes (g)</h4>
          <p>
            Adjust the portion sizes to match your preferences. These will be
            used when calculating portions.
          </p>
          {["small", "medium", "large"].map((sizeKey) => (
            <div key={sizeKey}>
              <label>
                {sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}:
              </label>
              <input
                type="number"
                value={settings.portionSizes[sizeKey]}
                onChange={(e) =>
                  handlePortionSizeChange(sizeKey, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </header>

      <div className="centre-container">
        <div className="inputs-row">
          <div className="calculator-input uncooked-input">
            <label>Uncooked (g)</label>
            <input
              type="number"
              value={uncooked}
              onChange={handleUncookedChange}
            />
          </div>
          <div className="bowl-graphic">
            {showSteam && (
              <div className="steam-container" ref={steamRef}>
                <svg className="steam" viewBox="0 0 20 60">
                  <path
                    d="M10 60 Q16 50 10 40 Q4 30 10 20 Q16 10 10 0"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <svg className="steam" viewBox="0 0 20 60">
                  <path
                    d="M10 60 Q16 50 10 40 Q4 30 10 20 Q16 10 10 0"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
                <svg className="steam" viewBox="0 0 20 60">
                  <path
                    d="M10 60 Q16 50 10 40 Q4 30 10 20 Q16 10 10 0"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
                <svg className="steam" viewBox="0 0 20 60">
                  <path
                    d="M10 60 Q16 50 10 40 Q4 30 10 20 Q16 10 10 0"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            )}

            <img src={getBowlImage(cooked)} alt="Rice Bowl" />
          </div>
          <div className="calculator-input cooked-input">
            <div className="tabs">
              <button
                onClick={() => setViewMode("grams")}
                className={viewMode === "grams" ? "active" : ""}
              >
                Grams
              </button>
              <button
                onClick={() => setViewMode("portions")}
                className={viewMode === "portions" ? "active" : ""}
              >
                Portions
              </button>
            </div>

            {viewMode === "grams" ? (
              <>
                <label>Cooked (g)</label>
                <input
                  type="number"
                  value={cooked}
                  onChange={handleCookedChange}
                />
              </>
            ) : (
              <>
                <label>Portions</label>
                <input
                  type="number"
                  value={portionCount}
                  onChange={(e) => setPortionCount(parseInt(e.target.value))}
                  min="1"
                />
                <select
                  value={portionSize}
                  onChange={(e) => setPortionSize(e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <small style={{ color: "#888" }}>
                  To view or change portion sizes, click the settings icon
                </small>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="water-container">
        <div>
          <label>Texture</label>
          <div className="texture-slider">
            <label>Firm</label>
            <input
              type="range"
              className="slider"
              min="0"
              max="100"
              step="50"
              value={texture}
              onChange={handleTextureChange}
            />
            <label>Soft</label>
          </div>
        </div>
        <div className="calculator-input">
          <label>Water</label>
          <input
            type="number"
            value={updateWater(uncooked, texture)}
            readOnly
          />
          ml
        </div>
      </div>
      <div className="instructions">
        <h3>How to Use</h3>
        <p>
          Use this calculator to work out the right amount of rice and water to
          use in your rice cooker based on your preferences. You can input your
          desired uncooked or cooked weight manually, or switch to{" "}
          <strong>Portions</strong> mode to select how many servings you want.
        </p>
        <p>
          The water amount is calculated based on your texture preference (Firm
          to Soft), and the cooked rice graphic updates based on how much you’re
          making.
        </p>
        <p>
          If your results don’t come out perfectly the first time, don’t worry —
          you can use the <strong>Settings </strong> to adjust the yield ratio
          based on your actual results. This helps the calculator learn your
          appliance and become more accurate over time.
        </p>
      </div>
    </div>
  );
}

export default App;
