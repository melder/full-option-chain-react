import { useState, useEffect, Fragment } from "react";
import moment from "moment-timezone";
import "./App.css";
import "rc-slider/assets/index.css";
import Card from "./components/Card";
import Slider from "rc-slider";
import TooltipSlider from "./components/TooltipSlider";

function App() {
    const cryptoChainsUrl = import.meta.env.VITE_CRYPTO_CHAINS_API_URL;

    // error states
    const [expirationsError, setExpirationsError] = useState(null);
    const [timestampsError, setTimestampsError] = useState(null);
    const [tickersError, setTickersError] = useState(null);

    // previously used loaded states similar to error states, but that is redundant
    // instead default values + null error state will imply loading state
    const [tickers, setTickers] = useState([]);
    const [expirationIndex, setExpirationIndex] = useState(-1);
    const [expirations, setExpirations] = useState<
        Record<number | string, string>
    >({});
    const [timestamps, setTimestamps] = useState([]);

    // helper states to render timestamp sliders
    const [timestampMin, setTimestampMin] = useState(-1);
    const [timestampMax, setTimestampMax] = useState(-1);
    const [timestampLeft, setTimestampLeft] = useState(-1);
    const [timestampRight, setTimestampRight] = useState(-1);

    // API call section //

    // First fetch expirations and render expiration slider
    useEffect(() => {
        fetch(`${cryptoChainsUrl}/expirations`)
            .then((res) => res.json())
            .then((result) => {
                const exprs = result.data ? result.data.slice(-4) : [];
                setExpirations(exprs);

                // Defaults to most recent expiration
                setExpirationIndex(exprs.length - 1);
            })
            .catch((error) => {
                setExpirationsError(error.message);
            });
    }, []);

    // Then fetch timestamps once expirations are retrieved
    // Expiration slider modifies expirationIndex and should trigger this to reload
    useEffect(() => {
        if (expirationIndex >= 0) {
            // Ensures we have a valid index
            fetch(
                `${cryptoChainsUrl}/timestamps?expr=${expirations[expirationIndex]}`
            )
                .then((res) => res.json())
                .then((result) => {
                    setTimestamps(result.data);
                    setTimestampMin(0);
                    setTimestampMax(result.data.length - 1);
                    setTimestampLeft(0);
                    setTimestampRight(result.data.length - 1);
                })
                .catch((error) => {
                    setTimestampsError(error.message);
                });
        }
    }, [expirationIndex]);

    // Tickers are independent of expiration and timestamps
    // Nonetheless tickers are required to render cards
    useEffect(() => {
        fetch(`${cryptoChainsUrl}/tickers`)
            .then((res) => res.json())
            .then(
                (result) => {
                    setTickers(result.data);
                },
                (error) => {
                    setTickersError(error.message);
                    console.log("Error retrieving tickers " + error);
                }
            );
    }, []);

    // Events section //

    const onTimeSliderChangeComplete = (value: number | number[]) => {
        if (Array.isArray(value)) {
            setTimestampLeft(value[0]);
            setTimestampRight(value[1]);
        }
    };

    const onExpirationSliderChangeComplete = (value: number | number[]) => {
        // Assert that value is a number, given the expected behavior of this slider
        const singleValue = Array.isArray(value) ? value[0] : value;
        setTimestampMin(-1);
        setTimestampMax(-1);
        setTimestampLeft(-1);
        setTimestampRight(-1);
        setTimestamps([]);
        setExpirationIndex(singleValue);
    };

    const handleTipFormatter = (value: number) =>
        moment(new Date(timestamps[value] * 1000))
            .tz("America/New_York")
            .format("llll");

    const lastFourMarks = Object.entries(expirations) // Convert to array of [key, value] pairs
        .reduce((acc, [key, value]) => {
            acc[key] = value; // Reconstruct an object with these last four entries
            return acc;
        }, {} as Record<number | string, string>); // Initial accumulator as the correct type

    if (expirationsError) {
        return <div>Expirations Error: {expirationsError}</div>;
    }

    if (timestampsError) {
        return <div>Expirations Error: {timestampsError}</div>;
    }

    if (tickersError) {
        return <div>Expirations Error: {tickersError}</div>;
    }

    return (
        <>
            <header>
                {expirationIndex === -1 ? (
                    <div className="expr-slider-container">Loading...</div>
                ) : (
                    <div className="expr-slider-container">
                        <Slider
                            min={0}
                            max={Object.keys(expirations).length - 1}
                            marks={lastFourMarks}
                            included={false}
                            defaultValue={expirationIndex}
                            onChangeComplete={onExpirationSliderChangeComplete}
                        />
                    </div>
                )}
                {timestamps.length > 0 &&
                timestampLeft >= 0 &&
                timestampRight >= 0 ? (
                    <div className="date-slider-container">
                        <TooltipSlider
                            range
                            min={timestampMin}
                            max={timestampMax}
                            defaultValue={[timestampLeft, timestampRight]}
                            allowCross={false}
                            onChangeComplete={onTimeSliderChangeComplete}
                            tipFormatter={handleTipFormatter}
                        />
                    </div>
                ) : (
                    <div className="date-slider-container">Loading...</div>
                )}
            </header>

            {expirationIndex >= 0 &&
            timestamps.length > 0 &&
            tickers.length > 0 ? (
                <div className="cards-container">
                    {tickers.map((ticker) => (
                        <Fragment key={ticker}>
                            <Card
                                key={`${ticker}-left`}
                                expr={expirations[expirationIndex]}
                                ticker={ticker}
                                timestamp={timestamps[timestampLeft]}
                            />
                            <Card
                                key={`${ticker}-right`}
                                expr={expirations[expirationIndex]}
                                ticker={ticker}
                                timestamp={timestamps[timestampRight]}
                            />
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className="cards-container loading">Loading...</div>
            )}
        </>
    );
}

export default App;
