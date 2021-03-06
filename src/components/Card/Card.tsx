import React, { useEffect, useState } from "react";
import * as styles from "./styles";
import images from "../../assets/images/images";
import { Props, WeatherData } from "./interfaces";
import utils from "../../utils/utils";
import Button from "../Button/Button";

const getTemperatureColor = (temp: number) => {
	if (temp === 5 || temp < 5) {
		return styles.getTemperature("Blue");
	}

	if (temp > 5 || temp < 25) {
		return styles.getTemperature("Orange");
	}

	if (temp > 25) {
		return styles.getTemperature("Red");
	}
};

const shouldFetchWeather = (city: string) => {
	let diffDate, minutes;

	if (!utils.getCacheData(city)) {
		return true;
	}

	diffDate = utils.getDiffBetweeenToday(utils.getCacheData(city).date);
	minutes = utils.getMillisecondsToMinutes(diffDate);

	return minutes > 9;
};

const getHeader = (city: string) => (
	<header style={styles.headerStyle}>{city}</header>
);

const getBody = (weatherData: WeatherData) => {
	const temperature = parseInt(weatherData.main.temp.toString(), 10),
		temperatureColor = getTemperatureColor(temperature);

	return (
		<section id={"sectionBody"} style={styles.sectionStyle}>
			<div style={temperatureColor}>
				{temperature}
				<div style={styles.degreeStyle}>{"º"}</div>
			</div>
		</section>
	);
};

const getHumidityPressure = (weatherData: WeatherData) => (
	<div style={styles.HumidityPressureContainerStyle}>
		<div style={styles.humidityContainerStyle}>
			<div style={styles.footerTitleStyle}>{`HUMIDITY`}</div>
			<div style={styles.footerSubtitleContainer}>
				<div style={styles.footerSubtitleStyle}>
					{weatherData.main.humidity}
				</div>
				<div style={styles.measureStyle}>{"%"}</div>
			</div>
		</div>
		<div>
			<div style={styles.footerTitleStyle}>{`PRESSURE`}</div>
			<div style={styles.footerSubtitleContainer}>
				<div style={styles.footerSubtitleStyle}>
					{weatherData.main.pressure}
				</div>
				<div style={styles.measureStyle}>{"hPa"}</div>
			</div>
		</div>
	</div>
);
const getFooter = (size: number, weatherData: WeatherData) => (
	<footer style={styles.getFooterStyle(size)}>
		{size === 1 && getHumidityPressure(weatherData)}
		<div
			style={styles.updatedAtStyle}
		>{`Updated at ${weatherData.updatedAt}`}</div>
	</footer>
);

const getContent = (size: number, weatherData: WeatherData) => (
	<>
		{getBody(weatherData)}
		{getFooter(size, weatherData)}
	</>
);

const getLoading = () => (
	<div id={"loadingContent"} style={styles.loadingContainerStyle}>
		<img src={images.loader} alt="Loading..." />
	</div>
);

const getErrorContent = (city: string, fetchData: Function) => (
	<div style={styles.errorContentContainer}>
		<span style={styles.errorMessageStyle}>{"Something went wrong"}</span>
		<Button onClick={fetchData.bind(undefined, city)}>{"Try Again"}</Button>
	</div>
);

const getContentOrLoadingOrError = (
	size: number,
	city: string,
	fetchData: Function,
	weatherData?: WeatherData,
	loadDataHasError?: boolean,
	loading?: boolean
) => {
	if (loading || (!weatherData && !loadDataHasError)) {
		return getLoading();
	}

	if (weatherData && !loadDataHasError) {
		return getContent(size, weatherData);
	}

	if (loadDataHasError) {
		return getErrorContent(city, fetchData);
	}
};

const Card: React.FC<Props> = (props: Props): React.ReactElement => {
	const { city, size, fetchData, loadDataHasError, loading } = props,
		[weatherData, setWeatherData] = useState(props.weatherData);

	useEffect(() => {
		if (shouldFetchWeather(city)) {
			fetchData(city);
		} else {
			setWeatherData(utils.getCacheData(city));
		}
	}, [props.weatherData]);

	return (
		<div style={styles.cardStyle[size]}>
			{getHeader(city)}
			{getContentOrLoadingOrError(
				size,
				city,
				fetchData,
				weatherData,
				loadDataHasError,
				loading
			)}
		</div>
	);
};

export default Card;
