declare namespace PageRoute {
  /**
   * the root route key
   * @translate 根路由
   */
  type RootRouteKey = 'root';

  /**
   * the not found route, which catch the invalid route path
   * @translate 未找到路由(捕获无效路径的路由)
   */
  type NotFoundRouteKey = 'not-found';

  /**
   * the route key
   * @translate 页面路由
   */
  type RouteKey =
    | '403'
    | '404'
    | '500'
    | 'constant-page'
    | 'login'
    | 'not-found'
    | 'dashboard'
    | 'dashboard_analysis'
    | 'dashboard_workbench'
    | 'management'
    | 'management_auth'
    | 'management_role'
    | 'management_route'
    | 'management_user'
    | 'mock'
    | 'mock_api-detail'
    | 'mock_api-list'
    | 'mock_project-detail'
    | 'mock_projects';

  /**
   * last degree route key, which has the page file
   * @translate 最后一级路由(该级路有对应的页面文件)
   */
  type LastDegreeRouteKey = Extract<
    RouteKey,
    | '403'
    | '404'
    | '500'
    | 'constant-page'
    | 'login'
    | 'not-found'
    | 'dashboard_analysis'
    | 'dashboard_workbench'
    | 'management_auth'
    | 'management_role'
    | 'management_route'
    | 'management_user'
    | 'mock_api-detail'
    | 'mock_api-list'
    | 'mock_project-detail'
    | 'mock_projects'
  >;
}
