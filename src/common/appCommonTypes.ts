import { Router } from "express";
import { UserController } from "../services/user/userController";

/**
 * Available services in the app
 */
export enum AppService {
  USER = "user",
}

/**
 * Available paths for each service
 */
export enum AppServicePath {
  USER = "/users",
  MOVIE = "/movies",
  REVIEW = "/reviews",
}

/**
 * Respective controllers in the app for each service
 */
export type AppController = {
  [AppService.USER]: UserController;
};

/**
 * Common interface for all controllers
 */
export interface Controller {
  path: string;
  router: Router;
  service: AppService;
  initializeRoutes(): void;
  getAvailableRoutes(): void;
}
