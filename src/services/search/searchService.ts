import 'dotenv/config';
import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { AuthRequest } from '../../common/authCommonTypes';
import { UserRoles } from '../../entities/User';
import { serviceAuthWrapper } from '../../wrapper/auth';
import { GooglePlacesAdapter } from '../../utils/google';

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

                const { latitude, longitude, city } = req.body;
                const google_places_adapter = GooglePlacesAdapter.getInstance();

                if (city) {
                    const places = await google_places_adapter.fetchRestaurantsWithTextSearch(
                        req.body.city,
                    )
    
                    return res.status(201).send({
                        message: 'A new searched was created',
                        places: places,
                    });
                }
                if (latitude && longitude) {
                    const places = await google_places_adapter.fetchRestaurantsWithNearbySearch(
                        req.body.latitude,
                        req.body.longitude,
                    )
    
                    return res.status(201).send({
                        message: 'A new searched was created',
                        places: places,
                    });
                }
                
            },
        });
    }
}