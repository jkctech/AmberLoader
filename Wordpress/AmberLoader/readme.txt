=== AmberLoader ===
Contributors: jkctech
Tags: amber alert,safety,netherlands,politie
Requires at least: 6.9
Tested up to: 6.9
Stable tag: 1.1
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Wordpress plugin for AmberLoader: an Automatic client-side Amber Alert notifier

== Description ==

### Display Amber Alerts from The Netherlands

AmberLoader is a highly customizable and lightweight Wordpress plugin that automatically checks for active Amber Alerts in The Netherlands.
It will displays them as a popup on your website to gain public awareness as fast a possible.

### 🧠 How does it work?

When an Amber Alert is issued in The Netherlands, [Burgernet](https://www.burgernet.nl) publishes image posters in different sizes which can be shown to the public.

Whenever a poster is published by Burgernet, AmberLoader will detect this and show the best fitting poster to the user depending on screen resolution and aspect ratio.

When clicked, the popup will link the user to [politie.nl/amberalert](https://politie.nl/amberalert) to provide the user with the most recent details. *(This can be overriden in settings)*

AmberLoader checks for active alerts **after the page finished loading** and only **every 5 minutes** *(By default)*. This way we ensure little to no impact on both performance and bandwith.

The popup will be shown on top of the website content and when the popup is hidden, a banner is placed above the page to allow the user to re-open the popup.

AmberLoader aims to be accessible for people using screen-readers by providing `aria-` tags where possible. This way vision impaired users will not get locked out of the hosting website.

== Screenshots ==

1. Active alert
2. Settings
2. Settings
