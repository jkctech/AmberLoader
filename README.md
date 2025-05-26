# AmberLoader

AmberLoader is a lightweight JavaScript module that automatically polls for active Amber Alerts in The Netherlands and displays them as posters on your website. It’s designed for quick embedding and easy customization.

<p align="middle">
	<img src="assets/widescreen.jpg" width="75%">
</p>

The module checks for active Amber Alert posters on pageload but only after a set interval to minimize API impact. If an alert is available, it shows a responsive popup with the alert poster.

It's fully client-side and includes options for behavior customization through HTML script tag attributes.

## 📦 Getting Started

To include AmberLoader on your webpage, insert the following script and CSS tags into your HTML. These links will use [JSDelivr](https://www.jsdelivr.com/):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.css">
<script src="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.js"></script>
```

Non-minified versions are also available:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.css">
<script src="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.js"></script>
```

## ⚙️ Available Settings

You can control AmberLoader's behavior using `data-` attributes on the script tag. Here's a list of available settings:

| Setting     | Type    | Default  |
|-------------|---------|----------|
| `interval`  | Number  | `300`    |
| `testmode`  | Boolean | `false`  |
| `hidetest`  | Boolean | `false`  |
| `nofooter`  | Boolean | `false`  |
| `autoclose` | Boolean | `false`  |
| `nohref`    | Boolean | `false`  |
| `loglevel`  | String  | `"warn"` |
| `bannertext`| String  | `"Amber Alert actief! (Klik om te openen)"` |

- `interval`: How often (in seconds) the system polls for a new alert.
- `testmode`: Switches to a test mode where demo posters are shown instead of real ones.
- `hidetest`: Hides the testmode indicators if you want that (Mostly useful for me lmao)
- `nofooter`: Disables the small footer with version info and GitHub link.
- `autoclose`: Automatically collapses the alert on next page load automatically.
- `nohref`: Disables linking to politie.nl.
- `loglevel`: Choose from `silent`, `error`, `warn`, `info`, or `debug`.

(Boolean settings are **false** by default and can be added without content to set them to **true**)

### Examples
```html
<!--- Simple testing config -->
<script src="..." data-interval="10" data-testmode data-loglevel="debug"></script>

<!--- Autoclose and only update every 10 minutes with a custom banner text -->
<script src="..." data-interval="600" data-autoclose data-bannertext="Amber Alert"></script>
```

## 🧠 How It Works

- Chooses the best poster size based on screen resolution.
- Saves data in cookies to prevent unnecessary API calls.
- Remembers when popup is closed to prevent a bad user experience.
- Attaches a banner and popup to the page while not obscuring the content.
- Offers accessibility via ARIA labels and keyboard navigation compatibility.
- Avoids layout shifts by adjusting website content.
- Styling can be overridden by custom CSS.

## 🔒 Notes

- AmberLoader is CORS-safe: it checks for the existence of posters via `<img>` loading instead of direct HTTP status.
- Poster updates are cached using cookies for performance.
- Requires no backend integration.

## 🛠 Planned Features

- Possibility to link to custom backend to cache Amber Alert API server side.
- Image banner mode instead of popup and seperate alert banner.
- More customizibility

## 📢 Report issues or contribute

Found a bug? Have a feature request or improvement idea? Contributions are welcome!

- 👉 [Open an issue](https://github.com/jkctech/AmberLoader/issues) for bugs or feature suggestions.
- 🛠️ Feel free to fork the project and submit a pull request.
- 💬 Feedback and ideas are always appreciated!
