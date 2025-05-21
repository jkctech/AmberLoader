/*=============================== AmberLoader =================================
  Author      : JKCTech
  Version     : 1.1.1
  Date        : 21-05-2025
  Description : Automatic client-side Amber Alert notifier
  Copyright   : Copyright © JKCTech
  GitHub      : https://github.com/jkctech/AmberLoader
=============================================================================*/

(function () {
	// Preferences
	const API_URL = 'https://services.burgernetcdn.nl/landactiehost/api/v1/alerts';
	const API_TESTURL = 'https://services.burgernet.nl/landactiehost/api/test/alerts';
	const POLL_INTERVAL_SECONDS = 300;

	// System vars
	const COOKIE_PREFIX = 'AmberLoader_';
	const COOKIE_POLL_KEY = COOKIE_PREFIX + 'lastPoll';
	const COOKIE_COLLAPSED_KEY = COOKIE_PREFIX + 'collapsed';
	const COOKIE_ALERTS_KEY = COOKIE_PREFIX + 'cachedAlerts';
	const BANNER_CONTAINER_ID = 'amberloader-container';

	// Get parameters
	// const currentScript = document.currentScript;
	// const url = new URL(currentScript.src);

	// Override settings from URL
	// const version = url.searchParams.get("version");

	// Cookies & helpers
	function setCookie(name, value, seconds) {
		const expires = seconds ? `; max-age=${seconds}` : "";
		document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
	}

	function getCookie(name) {
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : null;
	}

	function secondsSinceLastPoll() {
		const last = parseInt(getCookie(COOKIE_POLL_KEY) || '0', 10);
		return Math.floor(Date.now() / 1000) - last;
	}

	function updateLastPollTime() {
		setCookie(COOKIE_POLL_KEY, Math.floor(Date.now() / 1000).toString(), 3600);
	}

	function cacheAlerts(alerts) {
		try {
			setCookie(COOKIE_ALERTS_KEY, JSON.stringify(alerts), 3600);
		} catch {}
	}

	function getCachedAlerts() {
		try {
			const data = getCookie(COOKIE_ALERTS_KEY);
			const parsed = JSON.parse(data || '[]');
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	// User elements
	function createContainer() {
		if (document.getElementById(BANNER_CONTAINER_ID)) return;

		const container = document.createElement('div');
		container.id = BANNER_CONTAINER_ID;
		container.classList.add("amberloader-container");
		document.body.prepend(container);
	}

	function createCollapsedBanner() {
		const container = document.getElementById(BANNER_CONTAINER_ID);
		if (!container) return;

		container.innerHTML = '';

		const collapsed = document.createElement('div');
		collapsed.id = BANNER_CONTAINER_ID + "-collapsed";
		collapsed.classList.add("amberloader-collapsed");
		
		collapsed.textContent = 'Amber Alert actief! (Klik om te openen)';

		collapsed.onclick = () => {
			setCookie(COOKIE_COLLAPSED_KEY, 'false', 3600);
			container.innerHTML = '';
			renderAlerts(getCachedAlerts());
		};

		container.appendChild(collapsed);
		moveBodyToY(collapsed.offsetHeight);
	}

	function createBanner(alert) {
		const msg = alert.Message;
		const banner = document.createElement('div');
		banner.classList.add("amberloader-banner");

		if (msg.Media?.Image) {
			const img = document.createElement('img');
			img.classList.add("amberloader-image");
			img.src = msg.Media.Image;
			img.alt = 'Amber Alert foto';
			banner.appendChild(img);
		}

		const textContainer = document.createElement('div');
		textContainer.classList.add("amberloader-textcontainer");

		const title = document.createElement('div');
		title.classList.add("amberloader-title");
		textContainer.appendChild(title);

		if (alert.Type == "Alert")
		{
			title.innerHTML = msg.Title ? `Amber Alert: ${msg.Title}` : "Amber Alert";
		}
		else if (alert.Type == "Cancel")
		{
			title.innerHTML = "Amber Alert be&#235;indigd";
		}

		const desc = document.createElement('div');
		desc.classList.add("amberloader-description");
		desc.innerHTML = msg.Description;
		textContainer.appendChild(desc);

		if (alert.Type == "Alert")
		{
			const call = document.createElement('div');
			call.classList.add("amberloader-call");
			call.innerHTML = "Tips? Bel de opsporingstiplijn: <a href='tel:08006070'>0800-6070</a>";
			textContainer.appendChild(call);
		}

		const link = document.createElement('a');
		link.classList.add("amberloader-readmore");
		link.href = msg.Readmore_URL + "?utm_source=AmberLoader";
		link.textContent = 'Meer Informatie >';
		link.target = '_blank';
		textContainer.appendChild(link);

		const closeBtn = document.createElement('button');
		closeBtn.classList.add("amberloader-closebtn");
		closeBtn.textContent = '✕';

		closeBtn.onclick = () => {
			setCookie(COOKIE_COLLAPSED_KEY, 'true', 3600);
			createCollapsedBanner();
		};

		banner.appendChild(textContainer);
		banner.appendChild(closeBtn);

		document.getElementById(BANNER_CONTAINER_ID).appendChild(banner);
	}

	function moveBodyToY(pixels) {
		const children = Array.from(document.body.children);
	
		children.forEach(child => {
			if (child.id === BANNER_CONTAINER_ID) {
				return;
			}

			if (!child.hasAttribute('data-shifty-original')) {
				const computedTransform = window.getComputedStyle(child).transform;
				child.setAttribute(
					'data-shifty-original',
					(computedTransform && computedTransform !== 'none') ? computedTransform : ''
				);
			}
	
			const originalTransform = child.getAttribute('data-shifty-original');
			const newTransform = combineTransformWithTranslateY(originalTransform, pixels);
	
			child.style.transform = newTransform;
		});
	}
	
	function combineTransformWithTranslateY(baseTransform, pixels) {
		let cleaned = baseTransform.replace(/translateY\([^)]+\)/, '').trim();

		if (pixels !== 0) {
			cleaned += (cleaned ? ' ' : '') + `translateY(${pixels}px)`;
		}
	
		return cleaned || 'none';
	}

	// Actions
	function renderAlerts(alerts) {
		if (!alerts.length) return;
		createContainer();

		const collapsed = getCookie(COOKIE_COLLAPSED_KEY) === 'true';
		if (collapsed) {
			createCollapsedBanner();
		} else {
			alerts.forEach(createBanner);
			moveBodyToY(document.getElementById(BANNER_CONTAINER_ID).offsetHeight);
		}
	}

	async function fetchAlerts() {
		try {
			const res = await fetch(API_URL);
			const alerts = await res.json();
			const active = alerts.filter(a => a.State === 'Actual');
			if (active.length) {
				cacheAlerts(active);
			}
			updateLastPollTime();
		} catch (err) {
			console.error('Amber Alert fetch error:', err);
		}
	}

	function init() {
		const prepareAlerts = async () => {
			if (secondsSinceLastPoll() >= POLL_INTERVAL_SECONDS) {
				await fetchAlerts();
			}
			renderAlerts(getCachedAlerts());
		};

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', prepareAlerts);
		} else {
			prepareAlerts();
		}

		window.addEventListener("resize", function() {
			if (getCookie(COOKIE_COLLAPSED_KEY) === 'true') {
				const collapsed = document.getElementById(BANNER_CONTAINER_ID + "-collapsed");
				moveBodyToY(collapsed.offsetHeight);
			} else {
				moveBodyToY(document.getElementById(BANNER_CONTAINER_ID).offsetHeight);
			}
		});
	}

	init();
})();
