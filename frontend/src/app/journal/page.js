"use client";
import React, { useState, useEffect } from "react";
import { TradeTable } from "../../components/TradeTable";
import { Graph } from "../../components/Graph";
import { CommentsSection } from "../../components/CommentsSection";
import { fetchData } from "../utils/storage"; // Helper function for fetching from chrome.storage

const JournalPage = () => {
    const [trades, setTrades] = useState([]);
    const [graphType, setGraphType] = useState("PL"); // Default graph type

    useEffect(() => {
        // Fetch trade data from chrome.storage or local storage
        fetchData().then(setTrades);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Trade Journal</h1>

            {/* Graph Control */}
            <div className="mb-4">
                <label>Choose Graph: </label>
                <select
                    value={graphType}
                    onChange={(e) => setGraphType(e.target.value)}
                    className="ml-2"
                >
                    <option value="PL">Profit/Loss Over Time</option>
                    <option value="Asset">Trade Distribution by Asset</option>
                    <option value="RiskReward">Risk/Reward Analysis</option>
                </select>
            </div>

            {/* Dynamic Graph */}
            <Graph graphType={graphType} trades={trades} />

            {/* Trade Table */}
            <TradeTable trades={trades} />

            {/* Comments Section */}
            <CommentsSection trades={trades} />
        </div>
    );
};

export default JournalPage;