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
		
		// Set color-scheme for system UI
		document.documentElement.style.colorScheme = theme;
		
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
		});

		// Update icon visibility if present
		const iconMoon = document.getElementById('icon-moon');
		const iconSun = document.getElementById('icon-sun');
		if (iconMoon && iconSun) {
			if (isDark) {
				iconMoon.setAttribute('hidden', '');
				iconSun.removeAttribute('hidden');
			} else {
				iconSun.setAttribute('hidden', '');
				iconMoon.removeAttribute('hidden');
			}
		}
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
			localStorage.setItem(THEME_KEY, theme);
		} catch (e) {
			console.warn('Theme init error:', e);
			applyTheme(LIGHT);
		}
	}

	/**
	 * Toggle theme between light and dark
	 */
	function toggleTheme(e) {
		// Prevent default if called from click event
		if (e && e.preventDefault) {
			e.preventDefault();
		}
		
		const current = document.documentElement.getAttribute('data-theme') || LIGHT;
		const next = current === DARK ? LIGHT : DARK;
		applyTheme(next);
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch (err) {
			console.warn('localStorage error:', err);
		}
	}

	/**
	 * Setup theme toggle button listeners
	 */
	function setupToggleButtons() {
		const btn = document.getElementById('theme-toggle');
		if (btn) {
			// Remove any existing listeners
			btn.removeEventListener('click', toggleTheme);
			// Add fresh listener
			btn.addEventListener('click', toggleTheme, false);
		}
	}

	/**
	 * Watch for dynamically added buttons
	 */
	function watchForButtons() {
		const observer = new MutationObserver(() => {
			// Check if button exists and has listener
			const btn = document.getElementById('theme-toggle');
			if (btn && !btn.dataset.themeListenerAdded) {
				setupToggleButtons();
				btn.dataset.themeListenerAdded = 'true';
			}
		});
		
		observer.observe(document.body, { 
			childList: true, 
			subtree: true 
		});
	}

	/**
	 * Initialize theme system
	 */
	function init() {
		// Apply theme immediately
		initTheme();
		
		// Setup button listeners
		setupToggleButtons();
		
		// Watch for dynamically added buttons
		watchForButtons();
		
		// Setup delegation listener as backup
		document.addEventListener('click', (e) => {
			if (e.target.closest('[id="theme-toggle"]')) {
				toggleTheme(e);
			}
		}, true); // Use capture phase for better reliability
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	// Also expose toggle globally for debugging
	window.toggleTheme = toggleTheme;
	window.getTheme = () => document.documentElement.getAttribute('data-theme');
	window.setTheme = (t) => { applyTheme(t); localStorage.setItem(THEME_KEY, t); };
})();
