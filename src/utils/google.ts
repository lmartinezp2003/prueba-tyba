import axios from 'axios';

class GooglePlaseRestaurantResponseDTO {
    places: {
        formattedAddress: string;
        location: {
            latitude: number;
            longitude: number;
        };
        displayName: {
            text: string;
            language: string;
        };
    }[];
}

class GooglePlaceReataurantResponse {
    address: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    constructor(address: string, name: string, location: { latitude: number; longitude: number }) {
        this.address = address;
        this.name = name;
        this.location = location;
    }
}

export class GooglePlacesAdapter {
    private static instance: GooglePlacesAdapter | null = null;

    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY || '';
    }

    public static getInstance(): GooglePlacesAdapter {
        if (!this.instance) {
            this.instance = new GooglePlacesAdapter();
        }
        return this.instance;
    }

    public async fetchRestaurantsWithTextSearch(city: string) {
        const payload = {
            textQuery: 'Restaurants nearby: ' + city,
            pageSize: 20,
        };

        const response = await axios.post('https://places.googleapis.com/v1/places:searchText', payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,nextPageToken',
            },
        });

        console.log('Google Places response:', response.data);

        if (!response.data || !response.data.places) {
            console.error('Invalid response from Google Places API:', response.data);
            return [];
        }

        const places = (response.data as GooglePlaseRestaurantResponseDTO).places.map((place: any) => {
            return new GooglePlaceReataurantResponse(place.formattedAddress, place.displayName.text, place.location);
        });

        return places;
    }

    public async fetchRestaurantsWithNearbySearch(
        latitude: number,
        longitude: number,
    ): Promise<GooglePlaceReataurantResponse[] | undefined> {
        const payload = {
            includedTypes: ['restaurant'],
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: latitude,
                        longitude: longitude,
                    },
                    radius: 500.0,
                },
            },
        };

        const response = await axios.post('https://places.googleapis.com/v1/places:searchNearby', payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
            },
        });

        console.log('Google Places response:', response.data);

        if (!response.data || !response.data.places) {
            console.error('Invalid response from Google Places API:', response.data);
            return [];
        }

        const places = (response.data as GooglePlaseRestaurantResponseDTO).places.map((place: any) => {
            return new GooglePlaceReataurantResponse(place.formattedAddress, place.displayName.text, place.location);
        });

        return places;
    }
}
