/**
 * Unified Theme Manager
 * Handles dark/light theme switching with localStorage persistence
 * MUST be loaded FIRST - before stylesheet (in <head>)
 */

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
 * Toggle theme between light and dark
 */
window.toggleTheme = function() {
	const current = document.documentElement.getAttribute('data-theme') || LIGHT;
	const next = current === DARK ? LIGHT : DARK;
	applyTheme(next);
	try {
		localStorage.setItem(THEME_KEY, next);
	} catch (err) {
		console.warn('localStorage error:', err);
	}
};

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
 * Initialize when document is ready
 */
function initializeTheme() {
	if (document.readyState === 'loading') {
		// DOM still loading
		document.addEventListener('DOMContentLoaded', () => {
			initTheme();
		});
	} else {
		// DOM already ready
		initTheme();
	}
}

// Start initialization
initializeTheme();

// Expose globally for debugging
window.getTheme = () => document.documentElement.getAttribute('data-theme');
window.setTheme = (t) => { applyTheme(t); localStorage.setItem(THEME_KEY, t); };
