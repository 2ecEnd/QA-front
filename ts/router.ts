// ===== РОУТЕР =====
type RouteHandler = (params?: Record<string, string>) => Promise<void> | void;

interface Route {
  pattern: RegExp;
  handler: RouteHandler;
}

const routes: Route[] = [];

export function addRoute(pattern: RegExp, handler: RouteHandler) {
  routes.push({ pattern, handler });
}

export function navigate(path: string) {
  window.location.hash = path;
}

export async function handleRouteChange() {
  const hash = window.location.hash.slice(1) || '/';
  const container = document.getElementById('app-content');
  if (!container) return;

  container.innerHTML = '<div class="loader">Загрузка...</div>';

  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      if (match.groups) {
        Object.assign(params, match.groups);
      }
      try {
        await route.handler(params);
      } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="error">Ошибка загрузки страницы: ${error}</p>`;
      }
      return;
    }
  }

  container.innerHTML = '<h2>Страница не найдена</h2><a href="#/">На главную</a>';
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}