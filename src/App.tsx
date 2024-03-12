import { useState, useEffect } from "react";
import moment from "moment-timezone";

import "./App.css";

import "rc-slider/assets/index.css";

import Card from "./components/Card";
import TooltipSlider from "./components/TooltipSlider";

function App() {
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [timestamps, setTimestamps] = useState([]);
	const [normalizedTimestamps, setNormalizedTimestamps] = useState<
		Map<number, number>
	>(new Map());
	const [timestampMin, setTimestampMin] = useState(-1);
	const [timestampMax, setTimestampMax] = useState(-1);
	const [timestampLeft, setTimestampLeft] = useState(0);
	const [timestampRight, setTimestampRight] = useState(0);

	// Timestamp normalization for contiguous slider
	const mapTimestamps = (arr: number[]) => {
		const timestampToIndexMap = new Map();
		arr.forEach((timestamp: number, index: number) => {
			timestampToIndexMap.set(timestamp, index);
		});
		return timestampToIndexMap;
	};

	const onSliderChange = (value: number[]) => {
		// console.log("Slider value: " + value);
		setTimestampLeft(value[0]);
		setTimestampRight(value[1]);
	};

	const handleTipFormatter = (value: number) => {
		const myDatetimeString = moment(new Date(timestamps[value] * 1000));
		return myDatetimeString.tz("America/New_York").format("llll");
	};

	useEffect(() => {
		fetch("http://127.0.0.1:8000/timestamps?expr=2024-03-08")
			.then((res) => res.json())
			.then(
				(result) => {
					// console.log(result.data);

					setTimestamps(result.data);
					setNormalizedTimestamps(mapTimestamps(result.data));

					setTimestampMin(0);
					setTimestampMax(result.data.length - 1);

					setTimestampLeft(0);
					setTimestampRight(result.data.length - 1);

					setIsLoaded(true);
				},
				(error) => {
					setIsLoaded(true);
					setError(error.message);
				}
			);
	}, []);

	if (error) {
		return (
			<div>
				<div>Error: {error}</div>
			</div>
		);
	} else if (!isLoaded || timestampMin < 0 || timestampMax < 0) {
		return (
			<div>
				<div>Loading...</div>
			</div>
		);
	} else {
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
				<Card ticker="BITO" timestamp={timestamps[timestampLeft]} />
				<Card ticker="BITO" timestamp={timestamps[timestampRight]} />
				<Card ticker="HOOD" timestamp={timestamps[timestampLeft]} />
				<Card ticker="HOOD" timestamp={timestamps[timestampRight]} />
				<Card ticker="COIN" timestamp={timestamps[timestampLeft]} />
				<Card ticker="COIN" timestamp={timestamps[timestampRight]} />
				<Card ticker="MSTR" timestamp={timestamps[timestampLeft]} />
				<Card ticker="MSTR" timestamp={timestamps[timestampRight]} />
			</>
		);
	}
}

export default App;
