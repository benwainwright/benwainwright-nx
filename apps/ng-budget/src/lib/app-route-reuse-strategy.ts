import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
} from '@angular/router';

export class AppRouteReuseStrategy implements BaseRouteReuseStrategy {
  private routes = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  private key(route: ActivatedRouteSnapshot) {
    if (!route.paramMap.has('id')) {
      return route.routeConfig?.path ?? '';
    }

    return `${route.routeConfig?.path}${route.paramMap.get('id')}`;
  }

  store(
    route: ActivatedRouteSnapshot,
    detachedTree: DetachedRouteHandle
  ): void {
    this.routes.set(this.key(route), detachedTree);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      Boolean(route.routeConfig) && Boolean(this.routes.get(this.key(route)))
    );
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.routes.get(this.key(route)) ?? null;
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
