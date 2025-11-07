import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/carArrival";

const useCarArrivalCount = () => {
  const [count, setCount] = useState(0);
  const [carLoading, setCarLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarArrival = async () => {
      try {
        setCarLoading(true);
        const response = await axios.get(API_URL);
        const data = response.data;

        // Get the history array safely
        const history = data.history || [];

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Count history entries where date === today
        const todayCount = history.filter(entry => entry.date === today).length;

        setCount(todayCount);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch car arrival data");
      } finally {
        setCarLoading(false);
      }
    };

    fetchCarArrival();

    // Optional: refresh every 10 seconds
    const interval = setInterval(fetchCarArrival, 100000);
    return () => clearInterval(interval);
  }, []);

  return { count, carLoading, error };
};

export default useCarArrivalCount;
