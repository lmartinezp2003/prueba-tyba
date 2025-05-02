import { protos, PlacesClient } from "@googlemaps/places";

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

    private googlePlacesClient: PlacesClient;

    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY || "";
        this.googlePlacesClient = new PlacesClient({ key: this.apiKey });
    }

    public static getInstance(): GooglePlacesAdapter {
        if (!this.instance) {
            this.instance = new GooglePlacesAdapter();
        }
        return this.instance;
    }

    public async fetchRestaurantsWithTextSearch(city: string): Promise<GooglePlaceReataurantResponse[] | undefined> {
        const [response, _] = await this.googlePlacesClient.searchText({
            textQuery: "Restaurants nearby " + city,
            includedType: 'restaurant',
            maxResultCount: 10,
        }, {
            otherArgs: {
                headers: {
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
                }
            }
        });

        return response.places?.map((place) => {
            return new GooglePlaceReataurantResponse(
                place.formattedAddress || "",
                place.displayName.text || "",
                {
                    latitude: place.location?.latitude || 0,
                    longitude: place.location?.longitude || 0,
                }
            )
        })
    }

    public async fetchRestaurantsWithNearbySearch(latitude: number, longitude: number): Promise<GooglePlaceReataurantResponse[] | undefined> {
        const [response, _] = await this.googlePlacesClient.searchNearby(
            {
                includedTypes: ['restaurant'],
                maxResultCount: 10,
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: latitude,
                            longitude: longitude,
                        },
                        radius: 1000,
                    },
                },
                rankPreference: "DISTANCE",
            },
            {
                otherArgs: {
                    headers: {
                        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
                    }
                }   
            }
        );

        return response.places?.map((place) => {
            return new GooglePlaceReataurantResponse(
                place.formattedAddress || "",
                place.displayName.text || "",
                {
                    latitude: place.location?.latitude || 0,
                    longitude: place.location?.longitude || 0,
                }
            )
        })
    }

}