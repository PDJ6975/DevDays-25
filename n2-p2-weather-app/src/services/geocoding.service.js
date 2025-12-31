import WeatherService from './weather.service.js';

export const fetchCoordinatesOfCity = async (city, countryCode) => {
	// Si se proporciona código ISO y hay resultado -> obtenemos las coordenadas y devolvemos ciudad y coordenadas
	// Si no se proporciona código ISO y hay resultados -> seleccionamos el primero
};

export default {
	fetchCoordinatesOfCity,
};
