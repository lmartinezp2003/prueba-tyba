import { protos, PlacesClient } from "@googlemaps/places";

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

    public async fetchRestaurantsWithTextSearch(city: string): Promise<protos.google.maps.places.v1.ISearchNearbyResponse> {
        const [response, _] = await this.googlePlacesClient.searchText({
            textQuery: "Restaurants nearby " + city,
            maxResultCount: 10,
        }, {
            otherArgs: {
                headers: {
                    'X-Goog-FieldMask': '*'
                }
            }
        });

        return response
    }

    public async fetchRestaurantsWithNearbySearch(latitude: number, longitude: number): Promise<protos.google.maps.places.v1.ISearchNearbyResponse> {
        const [response, _] = await this.googlePlacesClient.searchNearby({
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
        });

        return response
    }

}