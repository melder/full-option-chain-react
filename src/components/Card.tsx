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
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [items, setItems] = useState({});
	const [strikes, setStrikes] = useState<Strikes>({});
	const [price, setPrice] = useState(0);

	const toPrettyDate = (value: number) => {
		const myDatetimeString = moment(new Date(value * 1000));
		return myDatetimeString.tz("America/New_York").format("llll");
	};

	useEffect(() => {
		fetch(
			`http://127.0.0.1:8000/option_chains?expr=2024-03-08&ticker=${ticker}&timestamp=${timestamp}`
		)
			.then((res) => res.json())
			.then(
				(result) => {
					// console.log(result);
					// console.log(result.data);

					setItems((items) => ({
						...items,
						...result.data,
					}));

					const timestamps = Object.keys(result.data);
					const inner = result.data[timestamps[0]];

					setStrikes((strikes) => ({
						...strikes,
						...inner["strikes"],
					}));

					setPrice(inner.price);

					setIsLoaded(true);
				},
				(error) => {
					setIsLoaded(true);
					setError(error.message);
				}
			);
	}, [timestamp]);

	const cardBody =
		Object.keys(strikes).length &&
		Object.keys(strikes)
			.reverse()
			.map((key) => (
				<div key={key} className="card-body-content">
					<div className="card-body-row">{key}</div>
					<div className="card-body-row">{strikes[key].call.volume}</div>
					<div className="card-body-row">{strikes[key].call.open_interest}</div>
					<div className="card-body-row">{strikes[key].put.volume}</div>
					<div className="card-body-row">{strikes[key].put.open_interest}</div>
				</div>
			));

	if (error) {
		return (
			<div className="card-root">
				<div>Error: {error}</div>
			</div>
		);
	} else if (!isLoaded || !price) {
		return (
			<div className="card-root">
				<div>Loading...</div>
			</div>
		);
	} else {
		return (
			<div className="card-root">
				<div className="card-header">
					<span className="card-header-ticker">{ticker}</span>
					<span className="card-header-date">{toPrettyDate(timestamp)}</span>
					<span className="card-header-price">${price}</span>
				</div>
				<div className="card-body">
					<div className="card-body-header">
						<div className="card-body-header-member">Strike</div>
						<div className="card-body-header-member">Call Volume</div>
						<div className="card-body-header-member">Call OI</div>
						<div className="card-body-header-member">Put Volume</div>
						<div className="card-body-header-member">Put OI</div>
					</div>
					{cardBody}
				</div>
			</div>
		);
	}
};

export default Card;
