/**
 * Unified Theme Manager
 * Handles dark/light theme switching with localStorage persistence
 * MUST be loaded FIRST - before stylesheet (in <head>)
 */
(function() {
	'use strict';

	const THEME_KEY = 'theme';
	const DARK = 'dark';
	const LIGHT = 'light';

	/**
	 * Apply theme to DOM and update all related elements
	 */
	function applyTheme(theme) {
		const isDark = theme === DARK;
		
		// Set data-theme on root
		document.documentElement.setAttribute('data-theme', theme);
		
		// Update meta theme-color for mobile
		const metaTheme = document.querySelector('meta[name="theme-color"]');
		if (metaTheme) {
			metaTheme.setAttribute('content', isDark ? '#0f0f14' : '#50358d');
		}
		
		// Update all theme toggle buttons on this page
		document.querySelectorAll('[id="theme-toggle"]').forEach(btn => {
			btn.setAttribute('aria-pressed', String(isDark));
			btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
			btn.setAttribute('aria-label', btn.title);
			
			// Update icon visibility (sun/moon)
			const iconMoon = btn.querySelector('#icon-moon');
			const iconSun = btn.querySelector('#icon-sun');
			if (iconMoon && iconSun) {
				if (isDark) {
					iconMoon.setAttribute('hidden', '');
					iconSun.removeAttribute('hidden');
				} else {
					iconSun.setAttribute('hidden', '');
					iconMoon.removeAttribute('hidden');
				}
			}
		});
		
		// Update color-scheme for system UI
		document.documentElement.style.colorScheme = theme;
	}

	/**
	 * Initialize theme on page load
	 */
	function initTheme() {
		try {
			// 1. Check localStorage first
			let saved = localStorage.getItem(THEME_KEY);
			
			// 2. Fall back to system preference
			if (!saved && window.matchMedia) {
				saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
			}
			
			// 3. Default to light
			const theme = saved || LIGHT;
			
			// Apply immediately
			applyTheme(theme);
		} catch (e) {
			console.warn('Theme init error:', e);
			applyTheme(LIGHT);
		}
	}

	/**
	 * Setup theme toggle button listeners
	 */
	function setupToggleButtons() {
		document.addEventListener('click', (e) => {
			if (e.target.closest('[id="theme-toggle"]')) {
				const current = document.documentElement.getAttribute('data-theme') || LIGHT;
				const next = current === DARK ? LIGHT : DARK;
				applyTheme(next);
				try {
					localStorage.setItem(THEME_KEY, next);
				} catch (err) {
					console.warn('localStorage error:', err);
				}
			}
		});
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initTheme);
		document.addEventListener('DOMContentLoaded', setupToggleButtons);
	} else {
		initTheme();
		setupToggleButtons();
	}
})();
