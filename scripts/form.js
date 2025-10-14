(() => {
	'use strict';
	const form = document.querySelector('form[data-contact]');
	if (!form) {
		// Reveal animations and count-up for homepage
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const revealEls = document.querySelectorAll('.reveal');
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries, obs) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('revealed');
						obs.unobserve(entry.target);
					}
				});
			}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
			revealEls.forEach((el, i) => {
				if (!prefersReduced) el.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
				observer.observe(el);
			});
		}

		// Count-up for highlight stats
		const nums = document.querySelectorAll('[data-count]');
		const animateCount = (el) => {
			const target = Number(el.getAttribute('target') || 0);
			if (!Number.isFinite(target)) return;
			const duration = prefersReduced ? 0 : 1200;
			const startTime = performance.now();
			const startVal = 0;
			const suffix = el.textContent?.trim().endsWith('%') ? '%' : (el.textContent?.trim().endsWith('x') ? 'x' : '');
			const step = (now) => {
				const t = Math.min(1, (now - startTime) / duration);
				const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
				const val = Math.round((startVal + (target - startVal) * eased));
				el.textContent = `${val}${suffix}`;
				if (t < 1) requestAnimationFrame(step);
			};
			if (duration === 0) {
				el.textContent = `${target}${suffix}`;
				return;
			}
			requestAnimationFrame(step);
		};
		if ('IntersectionObserver' in window) {
			const obs = new IntersectionObserver((entries, o) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateCount(entry.target);
						o.unobserve(entry.target);
					}
				});
			}, { threshold: 0.3 });
			nums.forEach((el) => obs.observe(el));
		} else {
			nums.forEach(animateCount);
		}
		// Glassy header on scroll
		const header = document.querySelector('.site-header');
		if (header) {
			header.classList.add('glass');
			const onScroll = () => {
				if (window.scrollY > 8) header.classList.add('scrolled');
				else header.classList.remove('scrolled');
			};
			onScroll();
			window.addEventListener('scroll', onScroll, { passive: true });
		}

		// Parallax hero
		const heroBg = document.querySelector('.hero .hero-bg');
		if (heroBg && !prefersReduced) {
			const bounds = () => heroBg.getBoundingClientRect();
			const onMove = (e) => {
				const rect = bounds();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				const dx = (e.clientX - cx) / rect.width; // -0.5..0.5
				const dy = (e.clientY - cy) / rect.height;
				heroBg.style.setProperty('--parallax-x', `${dx * 12}px`);
				heroBg.style.setProperty('--parallax-y', `${dy * 12}px`);
			};
			window.addEventListener('mousemove', onMove, { passive: true });
		}

		// Marquee animation (pause on hover)
		const marquee = document.getElementById('marquee-track');
		if (marquee && !prefersReduced) {
			let offset = 0;
			let paused = false;
			const step = () => {
				offset = (offset - 0.5) % 10000;
				if (!paused) marquee.style.transform = `translateX(${offset}px)`;
				requestAnimationFrame(step);
			};
			marquee.addEventListener('mouseenter', () => { paused = true; });
			marquee.addEventListener('mouseleave', () => { paused = false; });
			requestAnimationFrame(step);
		}

		// Case tilt hover
		const tilt = document.getElementById('case-tilt');
		if (tilt && !prefersReduced) {
			const onMove = (e) => {
				const r = tilt.getBoundingClientRect();
				const px = (e.clientX - r.left) / r.width - 0.5;
				const py = (e.clientY - r.top) / r.height - 0.5;
				tilt.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${py * -6}deg)`;
			};
			const reset = () => { tilt.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'; };
			tilt.addEventListener('mousemove', onMove);
			tilt.addEventListener('mouseleave', reset);
		}

		// Carousel controls
		const track = document.getElementById('testimonial-track');
		const prev = document.querySelector('[data-prev]');
		const next = document.querySelector('[data-next]');
		const snap = () => {
			if (!track) return;
			const cardWidth = track.querySelector('.card')?.getBoundingClientRect().width || 320;
			track.scrollBy({ left: cardWidth * (this?.dataset?.dir === 'prev' ? -1 : 1), behavior: prefersReduced ? 'auto' : 'smooth' });
		};
		prev?.addEventListener('click', () => {
			if (!track) return;
			const cardWidth = track.querySelector('.card')?.getBoundingClientRect().width || 320;
			track.scrollBy({ left: -cardWidth, behavior: prefersReduced ? 'auto' : 'smooth' });
		});
		next?.addEventListener('click', () => {
			if (!track) return;
			const cardWidth = track.querySelector('.card')?.getBoundingClientRect().width || 320;
			track.scrollBy({ left: cardWidth, behavior: prefersReduced ? 'auto' : 'smooth' });
		});

		// Timeline active step sync
		const navItems = document.querySelectorAll('.timeline-nav li');
		const sections = document.querySelectorAll('.timeline-content > section');
		if (sections.length && navItems.length) {
			const obs = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						navItems.forEach((li) => li.classList.remove('active'));
						const id = entry.target.getAttribute('id');
						const active = document.querySelector(`.timeline-nav a[href="#${id}"]`)?.parentElement;
						active?.classList.add('active');
					}
				});
			}, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
			sections.forEach((s) => obs.observe(s));
		}

		return;
	}
	// Form validation with inline aria-live errors
	const status = document.getElementById('form-status');
	const setError = (el, msg, errId) => {
		el?.setAttribute('aria-invalid', 'true');
		const err = document.getElementById(errId);
		if (err) err.textContent = msg;
	};
	const clearError = (el, errId) => {
		el?.removeAttribute('aria-invalid');
		const err = document.getElementById(errId);
		if (err) err.textContent = '';
	};

	form.addEventListener('submit', (e) => {
		const name = form.querySelector('input[name="name"]');
		const email = form.querySelector('input[name="email"]');
		const message = form.querySelector('textarea[name="message"]');
		let valid = true;
		if (!name || !name.value.trim()) { setError(name, 'Please enter your name', 'err-name'); valid = false; } else { clearError(name, 'err-name'); }
		const emailVal = email?.value.trim() || '';
		const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
		if (!email || !emailOk) { setError(email, 'Enter a valid email address', 'err-email'); valid = false; } else { clearError(email, 'err-email'); }
		if (!message || !message.value.trim()) { setError(message, 'Tell us a bit about your goals', 'err-message'); valid = false; } else { clearError(message, 'err-message'); }
		if (!valid) {
			e.preventDefault();
			if (status) { status.hidden = false; status.textContent = 'Please fix the errors below and try again.'; }
		}
	});

	// Theme toggle (persisted)
	const themeBtn = document.getElementById('theme-toggle');
	const logo = document.getElementById('site-logo');
	if (themeBtn) {
		const applyTheme = (t) => {
			document.documentElement.setAttribute('data-theme', t);
			const dark = t === 'dark';
			themeBtn.setAttribute('aria-pressed', String(dark));
			themeBtn.textContent = dark ? 'Theme: Dark' : 'Theme: Light';
			themeBtn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
			if (logo) logo.src = dark ? '/assets/EQUIVIDA transparent.png' : '/assets/EQUIVIDA  Black.png';
		};
		const saved = localStorage.getItem('theme') || 'light';
		applyTheme(saved);
		themeBtn.addEventListener('click', () => {
			const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
			applyTheme(next);
			localStorage.setItem('theme', next);
		});
	}
})();


