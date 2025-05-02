import { Router } from "express";
import { UserController } from "../services/user/userController";
import { SearchController } from '../services/search/searchController';

/**
 * Available services in the app
 */
export enum AppService {
  USER = "user",
  SEARCH = "/searches",
}

/**
 * Available paths for each service
 */
export enum AppServicePath {
  USER = "/users",
  SEARCH = "/searches",
}

/**
 * Respective controllers in the app for each service
 */
export type AppController = {
  [AppService.USER]: UserController;
  [AppService.SEARCH]: SearchController;
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