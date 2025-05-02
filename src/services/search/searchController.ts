import { Router } from 'express';
import { AppService, AppServicePath, Controller } from '../../common/appCommonTypes';
import SearchService from './searchService';

export class SearchController implements Controller {
    path: string;
    router: Router;
    service: AppService;
    private searchService: SearchService;

    constructor() {
        this.path = AppServicePath.SEARCH;
        this.service = AppService.SEARCH;
        this.router = Router();
        this.searchService = new SearchService();
        this.initializeRoutes();
    }

    /**
     * Initializes the routes
     */
    public initializeRoutes(): void {
        this.router.post(this.path, this.searchService.submitSearch);
    }

    /**
     * Prints the available routes
     */
    public getAvailableRoutes(): void {
        console.log('\nSearch service routes available:');
        this.router.stack.forEach(({ route }) => {
            const [availableRoute] = route.stack.map(({ method }) =>
                '- '.concat(method.toUpperCase()).concat(' ').concat(route.path),
            );
            console.log(availableRoute);
        });
    }
}