import { useState, useEffect } from "react";
import moment from "moment-timezone";
import "./App.css";
import "rc-slider/assets/index.css";
import Card from "./components/Card";
import TooltipSlider from "./components/TooltipSlider";

function App() {
    const cryptoChainsUrl = import.meta.env.VITE_CRYPTO_CHAINS_API_URL;

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tickers, setTickers] = useState([]);
    const [timestamps, setTimestamps] = useState([]);
    const [timestampMin, setTimestampMin] = useState(0);
    const [timestampMax, setTimestampMax] = useState(0);
    const [timestampLeft, setTimestampLeft] = useState(0);
    const [timestampRight, setTimestampRight] = useState(0);

    const onSliderChange = (value: number | number[]) => {
        const [left, right] = Array.isArray(value) ? value : [value, value];
        setTimestampLeft(left);
        setTimestampRight(right);
    };

    const handleTipFormatter = (value: number) =>
        moment(new Date(timestamps[value] * 1000))
            .tz("America/New_York")
            .format("llll");

    useEffect(() => {
        setIsLoaded(false);
        fetch(`${cryptoChainsUrl}/tickers`)
            .then((res) => res.json())
            .then(
                (result) => {
                    setTickers(result.data);
                },
                (error) => {
                    console.log("Error retrieving tickers " + error);
                }
            );
    }, []);

    useEffect(() => {
        setIsLoaded(false);
        fetch(`${cryptoChainsUrl}/timestamps?expr=2024-03-22`)
            .then((res) => res.json())
            .then(
                (result) => {
                    setTimestamps(result.data);
                    setTimestampMin(0);
                    setTimestampMax(result.data.length - 1);
                    setTimestampLeft(0);
                    setTimestampRight(result.data.length - 1);
                    setIsLoaded(true);
                },
                (error) => {
                    setError(error.message);
                    setIsLoaded(true);
                }
            );
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (
        !isLoaded ||
        tickers.length == 0 ||
        timestampMin < 0 ||
        timestampMax < 0
    ) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <header>
                <TooltipSlider
                    range
                    min={timestampMin}
                    max={timestampMax}
                    defaultValue={[timestampLeft, timestampRight]}
                    allowCross={false}
                    onChangeComplete={onSliderChange}
                    tipFormatter={handleTipFormatter}
                />
            </header>
            {tickers.map((ticker) => (
                <>
                    <Card
                        key={`${ticker}-left`}
                        ticker={ticker}
                        timestamp={timestamps[timestampLeft]}
                    />
                    <Card
                        key={`${ticker}-right`}
                        ticker={ticker}
                        timestamp={timestamps[timestampRight]}
                    />
                </>
            ))}
        </>
    );
}

export default App;
