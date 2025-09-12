
import axios from 'axios';

const GOOGLE_API_KEY = 'AIzaSyA76xfjC2lJOVwIE5FjmcoF7F2T3M6VaX44'; //dummy


export const fetchCitiesAndStates = async (userInput) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: userInput, 
          types: 'geocode', 
          key: GOOGLE_API_KEY, 
        },
      }
    );
    return response.data.predictions;
  } catch (error) {
    console.error('Error fetching city/state data from Google API:', error);
    throw error; r
  }
};
