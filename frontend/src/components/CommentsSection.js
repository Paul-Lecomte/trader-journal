export const CommentsSection = ({ trades }) => {
    const handleAddComment = (tradeId, comment) => {
        // Logic for adding comment and saving it in chrome.storage
        console.log(`Adding comment to trade ${tradeId}: ${comment}`);
    };

    return (
        <div className="mt-6">
            {trades.map((trade, index) => (
                <div key={index} className="mb-4">
                    <h2 className="font-semibold">Trade: {trade.asset}</h2>
                    <textarea
                        className="w-full p-2 border border-gray-300"
                        placeholder="Add your comments here..."
                        value={trade.comments || ""}
                        onChange={(e) => handleAddComment(trade.id, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
};