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

  store(
    route: ActivatedRouteSnapshot,
    detachedTree: DetachedRouteHandle
  ): void {
    this.routes.set(route.routeConfig?.path ?? '', detachedTree);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      Boolean(route.routeConfig) &&
      Boolean(this.routes.get(route.routeConfig?.path ?? ''))
    );
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.routes.get(route.routeConfig?.path ?? '') ?? null;
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
