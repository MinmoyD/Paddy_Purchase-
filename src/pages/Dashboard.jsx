import React from "react";
import StatCard from "../components/StatCard";
import ChartBox from "../components/ChartBox";
import StockChartCard from "../components/StockChartCard";
import WarehouseStockLineChart from "../components/WarehouseStockLineChart";
import Navbar from "../components/Navbar";
import CountUp from "react-countup";

import useStockSummary from "../Hooks/useStockSummary";
import useWarehouseData from "../Hooks/useWarehouseData";
import useCarArrivalCount from "../Hooks/useCarArrivalCount";

import Spinner from "../components/Spinner";
import "./Dashboard.css";
// import Chatbot from "../components/Chatbot";

const Dashboard = () => {
  const { totalBags, totalWeight, loading: stockLoading } = useStockSummary();
  const { totalWeight: todayWeight, totalBags: todayBags } = useWarehouseData();
  const { count, carLoading } = useCarArrivalCount();

  const cashAmount = 1250000;
  const cashLoading = false;

  return (
    <div className="dashboard">
      <Navbar />
      {/* <Chatbot/> */}
      <div className="cards-row">
        {/* Stock Card */}
        <StatCard
          title="Stock"
          value={
            stockLoading ? (
              <Spinner />
            ) : (
              <CountUp
                start={0}
                end={totalWeight / 100}
                duration={2}
                decimals={2}
                suffix=" Qntl"
              />
            )
          }
          description={`Bags: ${totalBags} (just updated)`}
          colorClass="bg-dark"
        />

        {/* Production Card */}
        <StatCard
          title="Production"
          value={
            stockLoading ? (
              <Spinner />
            ) : (
              <CountUp
                start={0}
                end={todayWeight / 100}
                duration={2}
                decimals={3}
                suffix=" Qntl"
              />
            )
          }
          description={"Today's Production"}
          colorClass="bg-blue"
        />

        {/* Number of Car Arrive Card */}
        <StatCard
          title="Number of Car Arrive"
          value={
            carLoading ? (
              <Spinner />
            ) : (
              <CountUp
                start={0}
                end={count}
                duration={2}
                separator=","
              />
            )
          }
          description="Just updated"
          colorClass="bg-pink"
        />

        {/* Cash Card */}
        <StatCard
          title="Cash"
          value={
            cashLoading ? (
              <Spinner />
            ) : (
              <CountUp
                start={0}
                end={cashAmount}
                duration={2}
                separator=","
                prefix="₹ "
              />
            )
          }
          description="Total Cash Available"
          colorClass="bg-yellow"
        />
      </div>

      <ChartBox />

      <div className="stock-chart-row">
        <StockChartCard />
      </div>

      <div className="warehouse-stock-row">
        <WarehouseStockLineChart />
      </div>
    </div>
  );
};

export default Dashboard;
