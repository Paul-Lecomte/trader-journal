import { Line, Bar, Scatter } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";

// Register the chart components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

export const Graph = ({ graphType, trades }) => {
    const chartData = {
        labels: trades.map((trade) => trade.date),
        datasets: [
            {
                label: graphType === "PL" ? "Profit/Loss" : graphType === "Asset" ? "Trades by Asset" : "Risk/Reward",
                data: graphType === "PL" ? trades.map((trade) => trade.PL) : graphType === "Asset" ? trades.map((trade) => trade.assetCount) : trades.map((trade) => trade.riskReward),
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                fill: graphType === "PL",
            },
        ],
    };

    if (graphType === "PL") {
        return <Line data={chartData} />;
    } else if (graphType === "Asset") {
        return <Bar data={chartData} />;
    } else {
        return <Scatter data={chartData} />;
    }
};
