# AmberLoader

AmberLoader is a lightweight JavaScript module that automatically checks for active **Amber Alerts in The Netherlands** and displays them as a popup on your website to gain public awareness as fast a possible.

<p align="middle">
	<img src="assets/widescreen.jpg" width="75%">
</p>

**AmberLoader is not affiliated with Amber Alert, Burgernet or the Dutch Police in any way.**

## 🧠 How does it work?

When an Amber Alert is issued in The Netherlands, [Burgernet](https://www.burgernet.nl) publishes image posters in different sizes which can be shown to the public.

Whenever a poster is published by Burgernet, AmberLoader will detect this and show the best fitting poster to the user depending on screen resolution and aspect ratio.

When clicked, the popup will link the user to [politie.nl/amberalert](https://politie.nl/amberalert) to provide the user with the most recent details. *(This can be overriden in settings)*

AmberLoader checks for active alerts **after the page finished loading** and only **every 5 minutes** *(By default)*. This way we ensure little to no impact on both performance and bandwith.

The popup will be shown on top of the website content and when the popup is hidden, a banner is placed above the page to allow the user to re-open the popup.

AmberLoader aims to be accessible for people using screen-readers by providing `aria-` tags where possible. This way vision impaired users will not get locked out of the hosting website.

## 📦 Getting Started

To include AmberLoader on your webpage, insert the following script and CSS tags into your HTML. These links will use [JSDelivr](https://www.jsdelivr.com/) as a CDN and will provide you with the latest updates from the Master branch automatically:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.css">
<script src="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.js"></script>
```

Non-minified versions are also available:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.css">
<script src="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.js"></script>
```

It's also possible to host the JS / CSS files yourself and server them to the user that way. Keep in mind this will not give you access to automatic updates.

## 🍪 Cookies

AmberLoader uses 3 cookies (Prefixed by `AmberLoader-`) to work properly:

| Name     | Description |
|-------------|---------|
| `lastpoll`  | Timestamp of last check. |
| `activealert`  | `true`\|`false` Used to prevent re-checking for alerts. |
| `collapsed`  | `true`\|`false` Remembers the state of the popup as collapsed or shown. |

## ⚙️ Customization

You can control AmberLoader's behavior using `data-` attributes on the script tag. Here's a list of available settings:

| Setting     | Type    | Default  |
|-------------|---------|----------|
| `polldelay`  | Number  | `300`    |
| `testmode`  | Boolean | `false`  |
| `hidetest`  | Boolean | `false`  |
| `nofooter`  | Boolean | `false`  |
| `autoclose` | Boolean | `false`  |
| `nohref`    | Boolean | `false`  |
| `loglevel`  | String  | `"warn"` |
| `bannertext`| String  | `...` |

- `polldelay`: How often (in seconds) the system polls for a new alert.
- `testmode`: Switches to a test mode where demo posters are shown instead of real ones.
- `hidetest`: Hides the testmode indicators if you want that (Mostly useful for development)
- `nofooter`: Disables the small footer with version info and GitHub link.
- `autoclose`: Automatically collapses the alert on next pageload.
- `nohref`: Disables linking to politie.nl.
- `loglevel`: Choose from `silent`, `error`, `warn`, `info`, or `debug`.
- `bannertext`: Change the text used in the banner when the popup is closed.

(Boolean settings are **false** by default and can be added without value to set them to **true**)

### Examples
```html
<!--- Simple testing config -->
<script src="..." data-polldelay="10" data-testmode data-loglevel="debug"></script>

<!--- Autoclose and only update every 10 minutes with a custom banner text -->
<script src="..." data-polldelay="600" data-autoclose data-bannertext="Amber Alert"></script>
```

## 🛠 Planned Features

- Possibility to link to custom backend to cache Amber Alert API server side.
- Image banner mode instead of popup and seperate alert banner.
- More customizibility
- Animations
- A Wordpress plugin

## 📢 Report issues or contribute

Found a bug? Have a feature request or improvement idea? Contributions are welcome!

- 👉 [Open an issue](https://github.com/jkctech/AmberLoader/issues) for bugs or feature suggestions.
- 🛠️ Feel free to fork the project and submit a pull request.
- 💬 Feedback and ideas are always appreciated!
