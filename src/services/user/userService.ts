import { Request, Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { middleware } from '../../middleware/auth';
import { generateJWT, getHashedPassword, passwordMatch } from '../../utils/encryption';
import HttpError from '../../utils/exception';
import { UserLogInRequest, UserSignUpRequest } from './userTypes';
import { User, UserRoles } from '../../entities/User';
import { AuthRequest } from '../../common/authCommonTypes';

export default class UsersService {
    /**
     * @api {POST} /users/register Registers a new user
     * @apiName RegisterUser
     * @apiGroup Auth
     * @apiVersion  1.0.0
     * @apiPermission PUBLIC
     * @apiParam  {String} [username] User name
     * @apiParam  {String} [email] User email
     * @apiParam  {String} [password] User password
     * @apiParam  {String} [passwordConfirmation] User password confirmation
     * @apiSuccess (201) {String} token JWT token
     * @apiSuccess (201) {String} username User name
     * @apiSuccess (201) {String} email User email
     * @apiError (400) {String} message Error registering user
     * @apiError (400) {String} message Passwords dont match
     * @apiError (400) {String} message User already exists
     * @apiError (500) {String} message Internal server error
     * @apiSuccessExample {json} Success-Response:
     * {
     *      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9. ..."
     *      "username": "ivangarl",
     *      "email": "ivangarl@yopmail.com",
     * }
     */
    public async register(req: AuthRequest, res: Response): Promise<void> {
        const signUpValidationSchema = J.object({
            username: J.string().required(),
            email: J.string().email().required(),
            password: J.string().min(10).required(),
            passwordConfirmation: J.string().min(10).required(),
        });
        return await middleware(req, res, {
            bodyValidation: signUpValidationSchema,
            validateToken: false,
            handler: async (req: Request, res: Response, manager: EntityManager) => {
                const { username, email, password, passwordConfirmation }: UserSignUpRequest = req.body;
                if (password !== passwordConfirmation) throw new HttpError(400, 'Passwords dont match');

                const existingUser = await manager.findOne(User, {
                    where: [{ email }, { username }],
                });

                if (existingUser) {
                    throw new HttpError(409, `A user with the email ${email} or ${username} already exists`);
                }

                try {
                    // Transacción para crear el nuevo usuario y generar el token
                    const { newUser, token } = await manager.transaction(async (tmanager) => {
                        const hashPassword = await getHashedPassword(password);

                        // Crear nuevo usuario
                        const newUser = new User({
                            username: username ? username.trim() : null,
                            email: email.toLowerCase(),
                            password: hashPassword,
                            role: UserRoles.USER,
                        });

                        // Guardar el usuario en la base de datos
                        const savedUser = await tmanager.save(newUser);

                        // Generar el token JWT
                        const token = generateJWT(savedUser);

                        return { newUser: savedUser, token };
                    });

                    // Enviar la respuesta con el token y los detalles del usuario
                    return res.status(201).send({
                        token,
                        username: newUser.username,
                        email: newUser.email,
                    });
                } catch (error) {
                    console.error('Error creating user', error);
                    throw new HttpError(error.status ?? 500, `Error creating user: ${error}`);
                }
            },
        });
    }

    /**
     * @api {POST} /users/login Logs in a user
     * @apiName LogInUser
     * @apiGroup Auth
     * @apiVersion  1.0.0
     * @apiPermission PUBLIC
     * @apiParam  {String} email User email
     * @apiParam  {String} password User password
     * @apiSuccess (200) {String} token JWT token
     * @apiSuccess (200) {String} email User email
     * @apiSuccess (200) {String} username User name
     * @apiError (400) {String} message Error logging in user
     * @apiError (404) {String} message User does not exist
     * @apiError (400) {String} message Passwords dont match
     * @apiError (500) {String} message Internal server error
     * @apiSuccessExample {json} Success-Response:
     * {
     *      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9. ..."
     *      "username": "ivangarl",
     *      "email": "ivangarl@yopmail.com",
     * }
     */
    public async logIn(req: AuthRequest, res: Response): Promise<void> {
        const logInValidationSchema = J.object({
            email: J.string().email().required(),
            password: J.string().min(10).required(),
        });
        return await middleware(req, res, {
            bodyValidation: logInValidationSchema,
            validateToken: false,
            handler: async (req: Request, res: Response, manager: EntityManager) => {
                const { email, password }: UserLogInRequest = req.body;

                let user = await manager.findOne(User, {
                    where: { email: email.toLowerCase() },
                });

                if (!user) {
                    throw new HttpError(404, `User does not exist`);
                }

                passwordMatch(password, user.password);

                res.send({
                    token: generateJWT(user),
                    username: user.username,
                    email: user.email,
                });
            },
        });
    }
}
