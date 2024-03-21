import "./Card.css";
import { useState, useEffect } from "react";
import moment from "moment-timezone";

interface Props {
    ticker: string;
    timestamp: number;
}

interface StrikeDetail {
    volume: number;
    open_interest: number;
}

interface Strike {
    call: StrikeDetail;
    put: StrikeDetail;
}

interface Strikes {
    [key: string]: Strike;
}

const Card = ({ ticker, timestamp }: Props) => {
    const cryptoChainsUrl = import.meta.env.VITE_CRYPTO_CHAINS_API_URL;
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [strikes, setStrikes] = useState<Strikes>({});
    const [price, setPrice] = useState<number | null>(null);

    const toPrettyDate = (value: number): string =>
        moment(new Date(value * 1000))
            .tz("America/New_York")
            .format("llll");

    useEffect(() => {
        fetch(
            `${cryptoChainsUrl}/option_chains?expr=2024-03-22&ticker=${ticker}&timestamp=${timestamp}`
        )
            .then((res) => res.json())
            .then((result) => {
                const firstTimestamp = Object.keys(result.data)[0];
                const inner = result.data[firstTimestamp];

                setStrikes(inner?.strikes ?? {});
                setPrice(inner?.price ?? null);
                setIsLoaded(true);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error.message);
            });
    }, [cryptoChainsUrl, ticker, timestamp]);

    if (error) {
        return <div className="card-root">Error: {error}</div>;
    } else if (!isLoaded || price === null) {
        return <div className="card-root">Loading...</div>;
    } else {
        return (
            <div className="card-root">
                <div className="card-header">
                    <span className="card-header-ticker">{ticker}</span>
                    <span className="card-header-date">
                        {toPrettyDate(timestamp)}
                    </span>
                    <span className="card-header-price">${price}</span>
                </div>
                <div className="card-body">
                    <div className="card-body-header">
                        <div className="card-body-header-member">Strike</div>
                        <div className="card-body-header-member">
                            Call Volume
                        </div>
                        <div className="card-body-header-member">Call OI</div>
                        <div className="card-body-header-member">
                            Put Volume
                        </div>
                        <div className="card-body-header-member">Put OI</div>
                    </div>
                    {Object.keys(strikes)
                        .reverse()
                        .map((key) => (
                            <div key={key} className="card-body-content">
                                <div className="card-body-row">{key}</div>
                                <div className="card-body-row">
                                    {strikes[key].call.volume}
                                </div>
                                <div className="card-body-row">
                                    {strikes[key].call.open_interest}
                                </div>
                                <div className="card-body-row">
                                    {strikes[key].put.volume}
                                </div>
                                <div className="card-body-row">
                                    {strikes[key].put.open_interest}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        );
    }
};

export default Card;
