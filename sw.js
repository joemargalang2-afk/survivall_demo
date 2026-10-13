/*! SURVIVALL v0.9.0 - © 2026 SURVIVALL Project Team. All rights reserved. */
// Service worker: makes the game installable (Add to Home screen) and fully playable offline after one online visit.
// On install it saves every game file (the list is filled in by the build). After that, files come from the saved
// copy first, so the game starts fast and works with bad or no internet. A new version uses a new cache name, so
// the browser fetches the new files once and removes the old copy.
const CACHE = "survivall-0.9.0-2026-10-13-b715207c";
const PRECACHE = ["./","assets/EarthquakeLoading-DE934BDQ.png","assets/FireLoading-CAGNNxaJ.png","assets/FloodLoading-CvjRvA_w.png","assets/fx/eruption.json","assets/fx/eruption.png","assets/fx/fire_itch.json","assets/fx/fire_itch.png","assets/fx/smoke.json","assets/fx/smoke.png","assets/index-BvbtI6Lq.js","assets/index-CvHgzE5k.css","assets/layers/house_poles.png","assets/layers/left_buildings.png","assets/layers/roof_children.png","assets/layers/sky.png","assets/layers/volcano.png","assets/layers/water.png","assets/layers/water_front.png","assets/Loading-BJOr9BYS.png","assets/map-K9MBc2pf.png","assets/maps/street.json","assets/maps/street_tiles.png","assets/phaser-H6HcJdkB.js","assets/pixelify-sans-latin-400-normal-DLrIX9QE.woff2","assets/pixelify-sans-latin-400-normal-JapMNN6Z.woff","assets/rolldown-runtime-CbXtAM7H.js","assets/scenes/collision.png","assets/scenes/goodwheel.json","assets/scenes/jabili.json","assets/scenes/mcdonkey.json","assets/scenes/props.json","assets/scenes/props.png","assets/scenes/tiles_dawn.png","assets/scenes/tiles_day.png","assets/scenes/tiles_night.png","assets/silkscreen-latin-400-normal-CtPo2yA5.woff2","assets/silkscreen-latin-400-normal-D0DfPJut.woff","assets/splash/intro.json","assets/splash/sidequest_logo.png","assets/splash/sidequest_sword.png","assets/sprites/characters/anims.json","assets/sprites/characters/boy.png","assets/sprites/characters/girl.png","assets/sprites/characters/npcs.png","assets/sprites/characters/portraits.png","assets/TaalLoading-DOt5tBZI.png","assets/ui/buttons.json","assets/ui/buttons.png","assets/ui/hud.json","assets/ui/hud.png","assets/ui/map/board.png","assets/ui/map/compass.png","assets/ui/map/hand.png","assets/ui/map/paper_crease.png","assets/ui/map/paper_frame.png","assets/ui/map/plaque.png","assets/ui/map/shield.png","assets/ui/menu_panel.png","assets/ui/rotate_phone.png","assets/ui/splash_master.png","data/lessons/after.json","data/lessons/before.json","data/lessons/during.json","data/lessons/README.md","icons/icon-192.png","icons/icon-512.png","index.html","manifest.webmanifest"];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE)
            .then((c) => c.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
    e.respondWith(
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
            if (res.ok) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
        }))
    );
});
