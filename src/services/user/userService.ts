import { Request, Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { serviceAuthWrapper } from '../../wrapper/auth';
import { generateJWT, getHashedPassword, passwordMatch } from '../../utils/encryption';
import HttpError from '../../utils/exception';
import { UserLogInRequest, UserSignUpRequest } from './userTypes';
import { User, UserRoles } from '../../entities/User';
import { AuthRequest } from '../../common/authCommonTypes';
import { blacklistToken } from '../../wrapper/auth';

export default class UsersService {
    public async register(req: AuthRequest, res: Response): Promise<void> {
        const signUpValidationSchema = J.object({
            username: J.string().required(),
            email: J.string().email().required(),
            password: J.string().min(10).required(),
            passwordConfirmation: J.string().min(10).required(),
        });
        return await serviceAuthWrapper(req, res, {
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

    public async logIn(req: AuthRequest, res: Response): Promise<void> {
        const logInValidationSchema = J.object({
            email: J.string().email().required(),
            password: J.string().min(10).required(),
        });
        return await serviceAuthWrapper(req, res, {
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

    public async logout(req: AuthRequest, res: Response): Promise<void> {
        return await serviceAuthWrapper(req, res, {
            validateToken: true,
            handler: async (req: AuthRequest, res: Response) => {
                const token = req.headers.authorization!;
                const exp = req.decodedToken.exp;
                const now = Math.floor(Date.now() / 1000);
                const ttl = Math.max(0, exp - now);

                await blacklistToken(token, ttl);

                return res.status(200).send({ message: "Logged out and token revoked" });
            }
        });
    }
}
