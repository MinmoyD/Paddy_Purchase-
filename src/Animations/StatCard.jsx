import React, { useEffect, useState } from "react";
import CountUp from "react-countup";

const StatCard = ({ title, value, description, colorClass, isLoading }) => {
  const [prevValue, setPrevValue] = useState(0);

  // Store previous value, but only update AFTER animation
  useEffect(() => {
    if (typeof value === "number") {
      const timer = setTimeout(() => {
        setPrevValue(value);
      }, 1200); // match duration of CountUp
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`stat-card ${colorClass} p-4 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105`}
    >
      <h3 className="text-gray-100 text-lg font-medium">{title}</h3>

      <div className="text-white text-3xl font-bold my-2">
        {isLoading ? (
          value // or <Spinner />
        ) : typeof value === "number" ? (
          <CountUp
            start={prevValue} // always starts from old value
            end={value}       // animates to new value
            duration={1.2}    // speed like YT subs
            separator=","
          />
        ) : (
          value
        )}
      </div>

      <p className="text-gray-200 text-sm">{description}</p>
    </div>
  );
};

export default StatCard;
