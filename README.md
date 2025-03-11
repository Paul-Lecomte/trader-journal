
# Trading Data Collector Browser Extension

This browser extension records and tracks trading data from TradingView to help analyze trading performance. It captures important details of each trade, such as the entry price, stop loss, take profit, risk-to-reward ratio, risk amount, potential profit, entry and exit times, and trade logs. This data is later used in a UI built with Next.js for deeper analysis and visualization.

## Features

- **Trade Entry Data**: Capture entry price, stop loss, and take profit.
- **Risk Analysis**: Automatically calculates risk-to-reward ratio, risk amount, and potential profit.
- **Time Tracking**: Records entry and exit times for each trade.
- **Trade Logs**: Stores logs for each trade taken.
- **Future Integration**: This extension will eventually integrate with a Next.js UI for detailed trade performance analysis.

## Installation

To install and use the extension:

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/Paul-Lecomte/trader-journal.git
   ```

2. Navigate to the extension folder:
   ```bash
   cd trader-journal
   ```

3. Load the extension in your browser:
    - **Chrome**:
        - Open `chrome://extensions/` in your browser.
        - Enable **Developer mode**.
        - Click **Load unpacked** and select the extension folder.
    - **Firefox**:
        - Open `about:debugging` in your browser.
        - Click **This Firefox** and then **Load Temporary Add-on**.
        - Select the extension folder.

## Usage

Once the extension is installed, it will automatically start recording the following data when you're on a TradingView chart:

- **Entry Price**: The price at which you enter the trade.
- **Stop Loss & Take Profit**: Automatically captured if set on the chart.
- **Risk/Reward**: The extension calculates this based on your stop loss, take profit, and entry price.
- **Risk Amount & Potential Profit**: Automatically calculated from your stop loss and take profit levels.
- **Entry and Exit Times**: Captures the time when you enter and exit a trade.
- **Trade Logs**: The extension logs each trade and its associated data.

## Data Storage

The data will be saved locally in the browser storage, ready for future integration with a Next.js UI for analysis.

## Roadmap

- **Version 1.0**: Basic functionality to collect trade data from TradingView.
- **Version 1.1**: Integration with Next.js UI to visualize and analyze the collected data.
- **Version 2.0**: Export functionality to CSV or other formats.

## Contributing

Contributions are welcome! If you want to improve this project, feel free to open a pull request or submit an issue.

### To contribute:
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Submit a pull request with a detailed explanation of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, feel free to open an issue or contact me.
