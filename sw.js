/*! SURVIVALL v0.10.0 - © 2026 SURVIVALL Project Team. All rights reserved. */
// Service worker: makes the game installable (Add to Home screen) and playable offline after one online visit.
// The build fills in CACHE (version, date and a hash of the file list) and PRECACHE ([path, size] for every file).
//  - install: saves the small files (everything under BIG bytes), each tried up to 3 times; a file that still fails is
//    skipped (it is saved later), so one bad request can never break the install. The big map picture is NOT
//    downloaded here: the page downloads it once (with a progress bar) and hands the worker its copy ('store').
//  - the game never waits for this worker; it works the same with no worker at all.
//  - pages: network first (so a new version shows on the next online visit), the saved copy when offline or after
//    NAV_TIMEOUT_MS without an answer. Files: the saved copy first, else the network (and the answer is saved).
//  - requests for part of a file (Range, used to resume the map download) always go to the network.
//  - a new version takes over at once, but keeps the older saved copies until the new page says it is running
//    ('cleanup'), so a game still open on the old version keeps finding its files.
const CACHE = "survivall-0.10.0-2026-10-26-cbeb17cb";
const PRECACHE = [["./",0],["assets/dashboard-B2NN2MwL.js",5227],["assets/EarthquakeLoading-DE934BDQ.png",109675],["assets/FireLoading-CAGNNxaJ.png",115149],["assets/FloodLoading-CvjRvA_w.png",127876],["assets/fx/eruption.json",2536],["assets/fx/eruption.png",128606],["assets/fx/fire_itch.json",17457],["assets/fx/fire_itch.png",31534],["assets/fx/smoke.json",1931],["assets/fx/smoke.png",132587],["assets/layers/house_poles.png",147660],["assets/layers/left_buildings.png",129564],["assets/layers/roof_children.png",97556],["assets/layers/sky.png",165810],["assets/layers/volcano.png",100873],["assets/layers/water.png",174882],["assets/layers/water_front.png",75479],["assets/Loading-BJOr9BYS.png",5604],["assets/main-CvHgzE5k.css",560],["assets/main-DqLV5689.js",231215],["assets/map-K9MBc2pf.png",18399154],["assets/maps/street.json",36881],["assets/maps/street_tiles.png",948],["assets/phaser-KEvMCxbo.js",1197596],["assets/phases-DSxqOii5.js",6592],["assets/pixelify-sans-latin-400-normal-DLrIX9QE.woff2",7692],["assets/pixelify-sans-latin-400-normal-JapMNN6Z.woff",10264],["assets/rolldown-runtime-CbXtAM7H.js",703],["assets/scenes/centromentral.json",11187],["assets/scenes/collision.png",184],["assets/scenes/goodwheel.json",12469],["assets/scenes/house_inside.json",10693],["assets/scenes/jabili.json",12579],["assets/scenes/lspu.json",11023],["assets/scenes/lspu_inside.json",10623],["assets/scenes/mall_inside.json",10732],["assets/scenes/market.json",11262],["assets/scenes/market_inside.json",10733],["assets/scenes/mcdonkey.json",13121],["assets/scenes/props.json",667],["assets/scenes/props.png",6413],["assets/scenes/tiles_centromentral.png",18354],["assets/scenes/tiles_dawn.png",47782],["assets/scenes/tiles_day.png",48706],["assets/scenes/tiles_house_inside.png",6262],["assets/scenes/tiles_lspu.png",14368],["assets/scenes/tiles_lspu_inside.png",4220],["assets/scenes/tiles_mall_inside.png",12894],["assets/scenes/tiles_market.png",16344],["assets/scenes/tiles_market_inside.png",9131],["assets/scenes/tiles_night.png",46533],["assets/silkscreen-latin-400-normal-CtPo2yA5.woff2",8404],["assets/silkscreen-latin-400-normal-D0DfPJut.woff",4940],["assets/splash/intro.json",399],["assets/splash/sidequest_logo.png",3560],["assets/splash/sidequest_sword.png",10145],["assets/sprites/characters/anims.json",1781],["assets/sprites/characters/boy.png",16707],["assets/sprites/characters/boy_mall.png",15692],["assets/sprites/characters/boy_market.png",16094],["assets/sprites/characters/boy_school.png",16117],["assets/sprites/characters/girl.png",20044],["assets/sprites/characters/girl_mall.png",18473],["assets/sprites/characters/girl_market.png",19009],["assets/sprites/characters/girl_school.png",19103],["assets/sprites/characters/npcs.png",3401],["assets/sprites/characters/portraits.png",26387],["assets/story/centromentral.png",12984],["assets/story/house_inside.png",5962],["assets/story/lspu.png",8742],["assets/story/lspu_inside.png",4321],["assets/story/mall_inside.png",11109],["assets/story/market.png",11184],["assets/story/market_inside.png",6864],["assets/story/mcdonkey.png",9472],["assets/TaalLoading-DOt5tBZI.png",121487],["assets/ui/buttons.json",2552],["assets/ui/buttons.png",22938],["assets/ui/hud.json",4112],["assets/ui/hud.png",5181],["assets/ui/map/board.png",5077],["assets/ui/map/compass.png",556],["assets/ui/map/hand.png",509],["assets/ui/map/paper_crease.png",179],["assets/ui/map/paper_frame.png",636],["assets/ui/map/plaque.png",498],["assets/ui/map/shield.png",318],["assets/ui/menu_panel.png",31439],["assets/ui/rotate_phone.png",273],["assets/ui/splash_master.png",1870860],["dashboard.html",5265],["data/assessments/after.json",1750],["data/assessments/before.json",1816],["data/assessments/during.json",1854],["data/assessments/README.md",2185],["data/challenges/gobag.json",7062],["data/lessons/after.json",3914],["data/lessons/before.json",3650],["data/lessons/during.json",3478],["data/lessons/preview.json",558],["data/lessons/README.md",2094],["data/lessons/tutorial.json",1344],["data/teacher.json",114],["icons/icon-192.png",920],["icons/icon-512.png",2670],["index.html",7985],["manifest.webmanifest",572]];
const PREFIX = 'survivall-';
const BIG = 2 * 1024 * 1024;
const NAV_TIMEOUT_MS = 4000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try {
            const res = await fetch(new Request(url, { cache: 'no-cache' }));
            if (res.ok && res.status === 200) return res;
        } catch { /* offline or a dropped connection: try again */ }
        await sleep(1000 * (i + 1));
    }
    return null;
}

// Save every listed file that is not saved yet (one at a time, so the game's own downloads keep most of the line).
async function fill(list) {
    const cache = await caches.open(CACHE);
    for (const [url] of list) {
        try {
            if (await cache.match(url)) continue;
            const res = await fetchWithRetry(url);
            if (res) await cache.put(url, res);
        } catch { /* storage full or blocked: keep going */ }
    }
}

self.addEventListener('install', (e) => {
    e.waitUntil(fill(PRECACHE.filter(([, size]) => size < BIG)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('message', (e) => {
    const msg = e.data || {};
    if (msg.type === 'store' && msg.url && msg.blob) {
        e.waitUntil((async () => {
            const cache = await caches.open(CACHE);
            if (await cache.match(msg.url)) return;
            await cache.put(msg.url, new Response(msg.blob, {
                headers: { 'Content-Type': msg.blob.type || 'application/octet-stream', 'Content-Length': String(msg.blob.size) }
            }));
        })().catch(() => {}));
    } else if (msg.type === 'fill') {
        e.waitUntil(fill(PRECACHE).catch(() => {}));
    } else if (msg.type === 'cleanup') {
        e.waitUntil(caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
            .catch(() => {}));
    }
});

async function fromCache(req) {
    const cache = await caches.open(CACHE);
    // this version's copy first; then an older version's (a game still open on the old version)
    return (await cache.match(req, { ignoreSearch: true })) || (await caches.match(req, { ignoreSearch: true }));
}

async function page(req) {
    const net = fetch(req).then(async (res) => {
        if (res.ok) {
            const cache = await caches.open(CACHE);
            const url = new URL(req.url);
            await cache.put(url.origin + url.pathname, res.clone()).catch(() => {});
        }
        return res;
    });
    const timeout = sleep(NAV_TIMEOUT_MS).then(() => null);
    const first = await Promise.race([net.catch(() => null), timeout]);
    if (first) return first;
    const saved = (await fromCache(req)) || (await caches.match('./'));
    if (saved) return saved;
    return net; // nothing saved yet: wait for the network (or its error)
}

async function file(req) {
    const saved = await fromCache(req);
    if (saved) return saved;
    const res = await fetch(req);
    if (res.ok && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
    }
    return res;
}

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
    if (req.headers.has('range')) return;
    e.respondWith(req.mode === 'navigate' ? page(req) : file(req));
});
