import 'dotenv/config';
import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { AuthRequest } from '../../common/authCommonTypes';
import { UserRoles } from '../../entities/User';
import { middleware } from '../../middleware/auth';

export default class SearchService {
    /**
     * @api {POST} /searches Submits a new review
     * @apiName SubmitSearch
     * @apiGroup Search
     * @apiVersion  1.0.0
     * @apiPermission USER
     */
    public async submitSearch(req: AuthRequest, res: Response): Promise<void> {
        const submitReviewValidationSchema = J.object({
            latitude: J.number().min(-90).max(90),
            longitude: J.number().min(-180).max(180).when('latitude', { is: J.exist(), then: J.required() }),
            city: J.string().trim(),
        }).xor('city', 'latitude');

        return await middleware(req, res, {
            bodyValidation: submitReviewValidationSchema,
            roles: [UserRoles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                console.log('mock search');

                return res.status(201).send({
                    message: 'A new searched was created',
                });
            },
        });
    }
}