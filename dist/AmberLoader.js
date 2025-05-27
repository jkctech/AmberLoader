/*=============================== AmberLoader =================================
  Author      : JKCTech
  Version     : 1.2.3
  Date        : 27-05-2025
  Description : Automatic client-side Amber Alert notifier
  Copyright   : Copyright © JKCTech
  GitHub      : https://github.com/jkctech/AmberLoader
=============================================================================*/

(function () {
	// Get client settings
	const SCRIPT = document.currentScript;
	const getConfig = key => SCRIPT.hasAttribute(`data-${key}`) ? SCRIPT.getAttribute(`data-${key}`) || true : undefined;

	// Settings
	const TESTMODE = getConfig('testmode') ?? false;
	const HIDETEST = getConfig('hidetest') ?? false;
	const POLLDELAY = getConfig('polldelay') ?? 300;
	const NOFOOTER = getConfig('nofooter') ?? false;
	const AUTOCLOSE = getConfig('autoclose') ?? false;
	const NOHREF = getConfig('nohref') ?? false;
	const BANNERTEXT = getConfig('bannertext') ?? "Amber Alert actief! (Klik om te openen)";

	// Setting logging
	const LOGLEVELS = { SILENT: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4};
	const LOGLEVEL = LOGLEVELS[getConfig('loglevel')?.toUpperCase()] ?? LOGLEVELS.WARN;

	// Constants
	const SIZELIST = [[3120,260],[1920,1200],[1920,1080],[1080,1920],[1792,640],[1560,1440],[1440,760],[1320,720],[1312,704],[1200,800],[1152,896],[1152,768],[1150,160],[980,440],[970,250],[936,624],[800,600],[800,130],[768,864],[768,405],[768,384],[728,90],[726,482],[720,540],[720,528],[640,540],[600,500],[588,1008],[576,480],[540,960],[480,270],[432,1008]];
	const BASEURL_PROD = "https://www.burgernet.nl/static/posters/landelijk/";
	const BASEURL_TEST = "https://www.burgernet.nl/static/posters/test/";
	const POLLURL = getSizeUrl(SIZELIST[SIZELIST.length - 1]);

	// System
	const VERSION = '1.2.3';
	const COOKIE_PREFIX = 'AmberLoader-';
	const COOKIE_POLL_KEY = COOKIE_PREFIX + 'lastpoll';
	const COOKIE_COLLAPSED_KEY = COOKIE_PREFIX + 'collapsed';
	const COOKIE_ACTIVEALERT_KEY = COOKIE_PREFIX + 'activealert';

	// Loggers
	const LOG_PREFIX = '[AmberLoader]';
	function logDebug(...args) { if (LOGLEVEL >= LOGLEVELS.DEBUG) { console.info(LOG_PREFIX, ...args); } }
	function logInfo(...args) { if (LOGLEVEL >= LOGLEVELS.INFO) { console.info(LOG_PREFIX, ...args); } }
	function logWarn(...args) { if (LOGLEVEL >= LOGLEVELS.WARN) { console.warn(LOG_PREFIX, ...args); } }
	function logError(...args) { if (LOGLEVEL >= LOGLEVELS.ERROR) { console.error(LOG_PREFIX, ...args); } }

	if (LOGLEVEL == LOGLEVELS.DEBUG)
	{
		logDebug("Debug logging is enabled!");
		logDebug("Loaded settings:");
		logDebug(` - testmode: ${TESTMODE}`);
		logDebug(` - polldelay: ${POLLDELAY}`);
		logDebug(` - nofooter: ${NOFOOTER ? "true" : "false"}`);
		logDebug(` - autoclose: ${AUTOCLOSE ? "true" : "false"}`);
		logDebug(` - nohref: ${NOHREF ? "true" : "false"}`);
	}

	// Image selection based on screen aspect ratio
	function getBestImage() 
	{
		const screenW = window.innerWidth;
		const screenH = window.innerHeight;
		const screenArea = screenW * screenH;
		const screenRatio = screenW / screenH;

		let bestImage = null;
		let bestScore = Number.POSITIVE_INFINITY;

		for (let img of SIZELIST) 
		{
			const imgRatio = img[0] / img[1];
			const ratioDiff = Math.abs(imgRatio - screenRatio);

			const imgArea = img[0] * img[1];
			const areaDiff = Math.abs(imgArea - screenArea);

			// Prefer closer aspect ratio (weighted higher), and size close to screen (lower weight)
			const score = ratioDiff * 1000 + areaDiff * 0.001;

			if (score < bestScore) 
			{
				bestImage = img;
				bestScore = score;
			}
		}

		// Fallback: If somehow none selected (shouldn't happen), pick highest res with best aspect
		if (!bestImage) 
		{
			logWarn('No best image was found, falling back to highest resolution with correct aspect ratio...');
			bestImage = SIZELIST.reduce((best, current) => {
				const currentRatioDiff = Math.abs(current.width / current.height - screenRatio);
				const bestRatioDiff = Math.abs(best.width / best.height - screenRatio);
				return (currentRatioDiff < bestRatioDiff || 
						(currentRatioDiff === bestRatioDiff && (current.width * current.height > best.width * best.height)))
				? current : best;
			});
			
		}

		logDebug(`Found best image size: ${bestImage}`);
		return bestImage;
	}

	// Translate size to url
	function getSizeUrl(bestImage) 
	{
		const base = TESTMODE ? BASEURL_TEST : BASEURL_PROD;
		return `${base}${bestImage[0]}x${bestImage[1]}.jpg`;
	}

	//  == Cookies & helpers ===
	function setCookie(name, value, seconds = 3600) 
	{
		const expires = seconds ? `; max-age=${seconds}` : "";
		document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
	}

	function getCookie(name) 
	{
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : null;
	}

	function secondsSinceLastPoll() 
	{
		const last = parseInt(getCookie(COOKIE_POLL_KEY) || '0', 10);
		return Math.floor(Date.now() / 1000) - last;
	}

	function updateLastPollTime() 
	{
		setCookie(COOKIE_POLL_KEY, Math.floor(Date.now() / 1000).toString());
	}

	function activeAlert() 
	{
		return getCookie(COOKIE_ACTIVEALERT_KEY) == 'true';
	}

	// Move body down to set pixels from top to fit our notification bar
	function moveBodyToY(pixels) 
	{
		const children = Array.from(document.body.children);
		logDebug(`Moving body and elements to Y ${pixels}...`);
	
		requestAnimationFrame(() => {
			children.forEach(child => {
				// Skip our own elements
				if (child.id.includes("AmberLoader-")) 
				{
					return;
				}

				if (!child.hasAttribute('data-shifty-original')) 
				{
					const computedTransform = window.getComputedStyle(child).transform;
					child.setAttribute(
						'data-shifty-original',
						(computedTransform && computedTransform !== 'none') ? computedTransform : ''
					);
				}
		
				const originalTransform = child.getAttribute('data-shifty-original');
				const newTransform = combineTransformWithTranslateY(originalTransform, pixels);
		
				child.style.transform = newTransform;

				logDebug(`Moved ${child}`);
			});
		});
		logDebug(`Body and elements have been moved!`);
	}

	// In case the element already has a transform, combine...
	function combineTransformWithTranslateY(baseTransform, pixels) 
	{
		let cleaned = baseTransform.replace(/translateY\([^)]+\)/, '').trim();

		if (pixels !== 0) 
		{
			cleaned += (cleaned ? ' ' : '') + `translateY(${pixels}px)`;
		}

		return cleaned || 'none';
	}

	// Build the actual poster popup and top bar
	function renderPoster()
	{
		// Double calls can happen, prevent and only build when alert is ongoing
		if (activeAlert() && !document.getElementById('AmberLoader-popup'))
		{
			logDebug("Rendering poster...");

			// Create popup
			const popup = document.createElement('div');
			popup.id = 'AmberLoader-popup';
			popup.classList.add('AmberLoader-popup');
			popup.ariaLabel = 'Amber Alert melding';

			if (getCookie(COOKIE_COLLAPSED_KEY) == 'true')
			{
				popup.classList.add('AmberLoader-hidden');
				logDebug("Active alert but popup is collapsed.");
			}

			// Close button
			const closeBtn = document.createElement('div');
			closeBtn.className = 'AmberLoader-closeBtn';
			closeBtn.innerHTML = '&times;';
			closeBtn.ariaLabel = 'Sluit Amber Alert melding';
			popup.appendChild(closeBtn);

			// Poster image
			const img = document.createElement('img');
			img.id = 'AmberLoader-image';
			img.className = 'AmberLoader-image';
			img.onerror = () => { logWarn("Poster attempted loading but failed, cancelling..."); cancelAlert(); };
			img.src = getSizeUrl(getBestImage());
			img.alt = 'Amber Alert';

			// Link (href on image)
			if (!NOHREF)
			{
				const link = document.createElement('a');
				link.href = 'https://www.politie.nl/amberalert';
				link.target = '_blank';
				link.rel = "noopener noreferrer"
				link.className = 'AmberLoader-imgLink';
				link.appendChild(img);
				popup.appendChild(link);
			}
			else
			{
				popup.appendChild(img);
			}

			// Footer
			if (!NOFOOTER)
			{
				const footer = document.createElement('div');
				footer.className = 'AmberLoader-footer';
				if (TESTMODE && !HIDETEST)
					footer.classList.add("AmberLoader-testmode");
				footer.innerHTML = `AmberLoader V${VERSION} - <a href="https://github.com/jkctech/AmberLoader" target="_blank" rel="noopener noreferrer">Probleem melden</a>`;
				popup.appendChild(footer);
			}

			// Banner
			const banner = document.createElement('div');
			banner.id = 'AmberLoader-banner';
			banner.className = 'AmberLoader-banner';
			banner.textContent = BANNERTEXT;
			banner.role = 'dialog';
			if (TESTMODE && !HIDETEST)
				banner.classList.add("AmberLoader-testmode");

			// Append to body
			document.body.prepend(popup);
			document.body.prepend(banner);

			// Close button onclick
			popup.querySelector('.AmberLoader-closeBtn').addEventListener('click', () => {
				popup.classList.add('AmberLoader-hidden');
				document.body.classList.remove('AmberLoader-noscroll');
				setCookie(COOKIE_COLLAPSED_KEY, true);
				logDebug("Popup has been collapsed.");
			});

			// Banner onclick, opens the popup
			banner.addEventListener('click', () => {
				popup.classList.remove('AmberLoader-hidden');
				document.body.classList.add('AmberLoader-noscroll');
				if (!AUTOCLOSE)
					setCookie(COOKIE_COLLAPSED_KEY, false);
				logDebug("Popup has been opened up.");
			});

			// Move body down to fit banner
			moveBodyToY(document.getElementById("AmberLoader-banner").offsetHeight);

			// Autoclose for next pageload if wanted
			if (AUTOCLOSE)
			{
				setCookie(COOKIE_COLLAPSED_KEY, true);
			}
		}
	}

	// We have to wait for polling image to load.
	// In case of alert closed, elements are already prepared but should be deleted.
	function cancelAlert()
	{
		if (activeAlert())
		{
			logDebug("Cancelling...");
			setCookie(COOKIE_ACTIVEALERT_KEY, false);
			setCookie(COOKIE_COLLAPSED_KEY, false);
			document.getElementById('AmberLoader-popup')?.remove();
			document.getElementById('AmberLoader-banner')?.remove();
			moveBodyToY(0);
			logDebug("Alert has been cancelled.");
		}
	}

	// CORS blocks me from trying to read HTTP status on the poster.
	// This is a workaround, we attempt to use the smallest poster as an image.
	// If it fails, nothing to do, if it loads, poster is available.
	async function UpdatePosters() 
	{
		// Temp image element
		const img = new Image();
		img.style.display = 'none';
		img.style.position = 'absolute';
		img.style.width = '0';
		img.style.height = '0';

		// Deleter for when we know what to do
		const cleanup = () => {
			img.onload = null;
			img.onerror = null;
			if (img.parentNode) 
			{
				img.parentNode.removeChild(img);
			}
			logDebug("Temp image deleted.");
		};

		// Image loaded, alert poster available, render...
		img.onload = () => {
			cleanup();
			setCookie(COOKIE_ACTIVEALERT_KEY, true);
			logInfo("Alert has been detected!");
			renderPoster();
		};

		// Error, nothing to display to user...
		img.onerror = () => {
			cleanup();
			setCookie(COOKIE_ACTIVEALERT_KEY, false);
			logDebug("No active alert detected.");
			cancelAlert();
		};

		// Load image
		document.body.appendChild(img);
		img.src = POLLURL;
		logDebug("Temp image created.");

		updateLastPollTime();
	}

	function init() 
	{
		// Prepare
		const prepareAlerts = async () => {
			if (secondsSinceLastPoll() >= POLLDELAY) 
			{
				logDebug("Polling for new alerts...");
				await UpdatePosters();
			}
			renderPoster();
		};

		// Wait for DOM to load and sync alerts + render
		if (document.readyState === 'loading') 
		{
			document.addEventListener('DOMContentLoaded', prepareAlerts);
		} else {
			prepareAlerts();
		}

		// When resizing, adjust image and move body down if needed
		window.addEventListener('resize', () => {
			if (activeAlert && document.getElementById('AmberLoader-popup')) 
			{
				logDebug("Resize...");

				// Replace image to fit screen
				document.getElementById("AmberLoader-image").src = getSizeUrl(getBestImage());

				// Move body down to fit banner
				moveBodyToY(document.getElementById("AmberLoader-banner").offsetHeight);
			}
		});
	}

	init();
})();
