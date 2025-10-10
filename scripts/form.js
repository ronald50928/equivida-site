(() => {
	'use strict';
	const form = document.querySelector('form[data-contact]');
	if (!form) return;
	form.addEventListener('submit', (e) => {
		const name = form.querySelector('input[name="name"]');
		const email = form.querySelector('input[name="email"]');
		const message = form.querySelector('textarea[name="message"]');
		let valid = true;
		[name, email, message].forEach((el) => {
			if (!el || !el.value.trim()) {
				el?.setAttribute('aria-invalid', 'true');
				valid = false;
			} else {
				el.removeAttribute('aria-invalid');
			}
		});
		if (!valid) {
			e.preventDefault();
			alert('Please fill out all required fields.');
		}
	});
})();


