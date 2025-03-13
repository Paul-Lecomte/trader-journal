"use client";
export const TradeTable = ({ trades }) => {
    return (
        <div className="mt-6">
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                <tr>
                    <th className="px-4 py-2 border border-gray-300">Asset</th>
                    <th className="px-4 py-2 border border-gray-300">Date</th>
                    <th className="px-4 py-2 border border-gray-300">P/L</th>
                    <th className="px-4 py-2 border border-gray-300">Comments</th>
                </tr>
                </thead>
                <tbody>
                {trades.map((trade, index) => (
                    <tr key={index}>
                        <td className="px-4 py-2 border border-gray-300">{trade.asset}</td>
                        <td className="px-4 py-2 border border-gray-300">{trade.date}</td>
                        <td className="px-4 py-2 border border-gray-300">{trade.PL}</td>
                        <td className="px-4 py-2 border border-gray-300">{trade.comments || "N/A"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};