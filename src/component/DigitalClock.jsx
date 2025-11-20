import React, { useState, useEffect } from "react";

const timeZones = [
  { label: "UTC", zone: "UTC" },
  { label: "India", zone: "Asia/Kolkata" },
  { label: "New York", zone: "America/New_York" },
  { label: "London", zone: "Europe/London" },
  { label: "Tokyo", zone: "Asia/Tokyo" },
  // add more as needed
];

function DigitalClock({position}) {
  const [now, setNow] = useState(new Date());
  const [currentZone, setCurrentZone] = useState("Asia/Kolkata");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={position}>
      <h2>World Digital Clock</h2>
      <select onChange={(e)=>setCurrentZone(e.target.value)}>
        {timeZones.map(({ label, zone }) => (
          <option key={zone} value={zone} >
            {label}
          </option>
        ))}
      </select>
      <ul>
        {timeZones.map(({ label, zone }) => (
         currentZone ==zone ? <li key={zone}>
            <b>{label}:</b>{" "}
            {now.toLocaleTimeString("en-US", { timeZone: zone, hour12: false })}
          </li>: null
        ))}
      </ul>
    </div>
  );
}

export default DigitalClock;