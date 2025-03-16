
# Trading Data Collector Browser Extension

This browser extension captures and tracks trading data from TradingView to help analyze your trading performance. It records key details such as entry price, stop loss, take profit, risk-to-reward ratio, risk amount, potential profit, and entry/exit times. This data is saved locally and will be used in a future UI built with Next.js for deeper performance analysis and visualization.

## Features

- **Trade Entry Data**: Logs entry price, stop loss, and take profit.
- **Risk Analysis**: Automatically calculates risk-to-reward ratio, risk amount, and potential profit.
- **Time Tracking**: Records entry and exit times for each trade.
- **Trade Logs**: Stores logs for every trade.
- **Future Integration**: A full-featured Next.js UI will be integrated for advanced trade analysis and visualization.

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
      - Open `chrome://extensions/`.
      - Enable **Developer mode**.
      - Click **Load unpacked** and select the extension folder.
   - **Firefox**:
      - Open `about:debugging`.
      - Click **This Firefox** and then **Load Temporary Add-on**.
      - Select the extension folder.

## Usage

Once installed, the extension will automatically start recording the following data when you’re on a TradingView chart:

- **Entry Price**: Captures the price at which you enter the trade.
- **Stop Loss & Take Profit**: Automatically records if set on the chart.
- **Risk/Reward**: Calculated based on stop loss, take profit, and entry price.
- **Risk Amount & Potential Profit**: Automatically calculated from stop loss and take profit levels.
- **Entry and Exit Times**: Tracks when you enter and exit each trade.
- **Trade Logs**: Logs each trade with all relevant details.

## Data Storage

Data is saved locally in the browser and will be integrated with a Next.js UI for detailed analysis and visualization in the future.

## Roadmap

- **Version 1.0**: Basic functionality for collecting trade data from TradingView.
- **Version 2.0**: Data export functionality (CSV or other formats).

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Submit a pull request with a detailed explanation of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, feel free to open an issue or contact me.