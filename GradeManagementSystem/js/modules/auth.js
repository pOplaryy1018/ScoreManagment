// 全局认证与前端路由模块
(function () {
  const ROLE_HOME = {
    guest: 'pages/public-courses.html',
    student: 'pages/student-portal.html',
    teacher: 'pages/teacher-dashboard.html',
    teaching_admin: 'pages/teaching-admin.html',
    admin: 'pages/grade-audit.html'
  };

  const STORAGE_KEYS = {
    user: 'user',
    token: 'token',
    loginTime: 'loginTime'
  };

  const DEFAULT_SESSION_DURATION = 2 * 60 * 1000; // 与登录页保持一致（2分钟）

  function now() {
    return Date.now();
  }

  function getStorage() {
    return (window.Utils && Utils.storage) || {
      set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
      get: (k, d = null) => {
        const raw = localStorage.getItem(k);
        return raw ? JSON.parse(raw) : d;
      },
      remove: (k) => localStorage.removeItem(k)
    };
  }

  const Auth = {
    ROLE_HOME,
    DEFAULT_SESSION_DURATION,

    getRoleHome(role) {
      return ROLE_HOME[role] || ROLE_HOME.guest;
    },

    getCurrentUser() {
      return getStorage().get(STORAGE_KEYS.user);
    },

    getSessionDuration() {
      return DEFAULT_SESSION_DURATION;
    },

    isSessionValid() {
      const storage = getStorage();
      const user = storage.get(STORAGE_KEYS.user);
      const loginTime = storage.get(STORAGE_KEYS.loginTime);
      if (!user || !loginTime) return false;
      const duration = this.getSessionDuration();
      return now() - loginTime <= duration;
    },

    ensureSessionFresh() {
      if (this.isSessionValid()) {
        getStorage().set(STORAGE_KEYS.loginTime, now());
      }
    },

    startSession(user, token) {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.user, user);
      storage.set(STORAGE_KEYS.token, token || `mock_token_${now()}`);
      storage.set(STORAGE_KEYS.loginTime, now());
    },

    clearSession() {
      const storage = getStorage();
      storage.remove(STORAGE_KEYS.user);
      storage.remove(STORAGE_KEYS.token);
      storage.remove(STORAGE_KEYS.loginTime);
    },

    logout(redirect = true) {
      this.clearSession();
      if (redirect) {
        this.navigateToLogin();
      }
    },

    navigateToLogin() {
      if (window.Utils && typeof Utils.navigateTo === 'function') {
        Utils.navigateTo('../index.html');
      } else {
        window.location.href = '../index.html';
      }
    },

    navigateToHome(role) {
      const target = this.getRoleHome(role);
      const isSubPage = /\/pages\//.test(window.location.pathname);
      const finalTarget = target.startsWith('../') || target.startsWith('http')
        ? target
        : (isSubPage ? `../${target}` : target);
      if (window.Utils && typeof Utils.navigateTo === 'function') {
        Utils.navigateTo(finalTarget);
      } else {
        window.location.href = finalTarget;
      }
    },


    enforcePageAccess(allowedRoles = [], options = {}) {
      const { redirectToLogin = true, redirectHomeOnDeny = true } = options;
      const storage = getStorage();
      const user = storage.get(STORAGE_KEYS.user);
      const loginTime = storage.get(STORAGE_KEYS.loginTime);

      if (!user) {
        if (redirectToLogin) this.navigateToLogin();
        return false;
      }

      if (!loginTime || now() - loginTime > this.getSessionDuration()) {
        this.logout(true);
        return false;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (redirectHomeOnDeny) {
          this.navigateToHome(user.role);
        }
        return false;
      }

      // 刷新会话时间
      storage.set(STORAGE_KEYS.loginTime, now());
      return true;
    },

    requireApiPermission(requiredRoles = []) {
      const user = this.getCurrentUser();
      if (!user) return false;
      if (requiredRoles.length === 0) return true;
      return requiredRoles.includes(user.role);
    },

    initSpaNavigation(options = {}) {
      const {
        navSelector = '[data-route]',
        viewSelector = '[data-view]',
        activeClass = 'active',
        defaultRoute = null
      } = options;

      const navLinks = Array.from(document.querySelectorAll(navSelector));
      const views = Array.from(document.querySelectorAll(viewSelector));

      function switchTo(route) {
        if (!route) return;
        navLinks.forEach(link => {
          const isActive = link.dataset.route === route;
          link.classList.toggle(activeClass, isActive);
          if (link.parentElement && !link.parentElement.classList.contains('nav-item')) {
            return;
          }
          if (link.parentElement) {
            link.parentElement.classList.toggle(activeClass, isActive);
          }
        });

        views.forEach(view => {
          const match = view.dataset.view === route || view.id === route;
          view.classList.toggle('active', match);
          view.style.display = match ? '' : 'none';
        });
      }

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const route = link.dataset.route;
          switchTo(route);
        });
      });

      const initialRoute = defaultRoute || (navLinks[0] && navLinks[0].dataset.route) || (views[0] && (views[0].dataset.view || views[0].id));
      switchTo(initialRoute);

      return { switchTo };
    }
  };

  window.Auth = Auth;
})();
