import 'dotenv/config';
import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { AuthRequest } from '../../common/authCommonTypes';
import { UserRoles } from '../../entities/User';
import { serviceAuthWrapper } from '../../wrapper/auth';
import { GooglePlacesAdapter } from '../../utils/google';
import { Search } from '../../entities/Search';

export default class SearchService {
    public async submitSearch(req: AuthRequest, res: Response): Promise<void> {
        const submitReviewValidationSchema = J.object({
            latitude: J.number().min(-90).max(90),
            longitude: J.number().min(-180).max(180).when('latitude', { is: J.exist(), then: J.required() }),
            city: J.string().trim(),
        }).xor('city', 'latitude');

        return await serviceAuthWrapper(req, res, {
            bodyValidation: submitReviewValidationSchema,
            roles: [UserRoles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { userId } = req.decodedToken;
                const { latitude, longitude, city } = req.body;
                const google_places_adapter = GooglePlacesAdapter.getInstance();

                if (city) {
                    const places = await google_places_adapter.fetchRestaurantsWithTextSearch(req.body.city);

                    if (places.length === 0) {
                        return res.status(404).send({
                            message: 'No places found',
                        });
                    }

                    const closestPlace = places[0].location;
                    const newSearch = new Search({
                        userId: userId,
                        latitude: closestPlace.latitude,
                        longitude: closestPlace.longitude,
                        city: req.body.city,
                    });
                    await manager.save(newSearch);

                    return res.status(201).send({
                        message: 'A new searched was created',
                        places: places,
                    });
                }
                if (latitude && longitude) {
                    const places = await google_places_adapter.fetchRestaurantsWithNearbySearch(
                        req.body.latitude,
                        req.body.longitude,
                    );

                    if (places.length === 0) {
                        return res.status(404).send({
                            message: 'No places found',
                        });
                    }

                    const newSearch = new Search({
                        userId: userId,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                    });

                    await manager.save(newSearch);

                    return res.status(201).send({
                        message: 'A new searched was created',
                        places: places,
                    });
                }
            },
        });
    }

    public async getSearches(req: AuthRequest, res: Response): Promise<void> {
        const getUserSearchesValidationSchema = J.object({
            page: J.number().min(1).default(1).optional().allow(null),
        });

        return await serviceAuthWrapper(req, res, {
            roles: [UserRoles.USER],
            validateToken: true,
            queryValidation: getUserSearchesValidationSchema,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { page } = req.query;
                const { userId } = req.decodedToken;

                const searches = await manager.find(Search, {
                    where: {
                        userId: userId,
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                    take: 10,
                    skip: (Number(page ?? 1) - 1) * 10,
                });

                if (searches.length === 0) {
                    return res.status(404).send({
                        message: 'No searches found',
                    });
                }

                return res.status(200).send({
                    searches,
                    pages: Math.ceil(searches.length / 10),
                    currentPage: Number(page ?? 1),
                });
            },
        });
    }
}
