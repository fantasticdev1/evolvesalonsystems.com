document.addEventListener('click', function(event) {
	let target = event.target;

	if (target) {
		if (typeof target.dataset.open !== 'undefined') {
			event.preventDefault();
		}
	}
});
