// ===== NetPulse Real Speed Test - ALL BUGS FIXED =====

document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initThemeSwitcher();
    initParticles();
    initGauge();
    initSpeedTest();
    initHistory();

    // Start weather immediately with timezone fallback (don't wait for IP)
    startWeatherFallback();

    // Then try IP detection (will update weather if better coords found)
    fetchIPInfo();
});

// ===== CLOCK =====
function initClock() {
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('clockTime').textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', options);

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzShort = tz.split('/').pop().replace(/_/g, ' ');
        document.getElementById('tzBadge').textContent = tzShort;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// ===== THEME SWITCHER =====
function initThemeSwitcher() {
    const savedTheme = localStorage.getItem('netpulse-theme') || 'cyber';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateActiveThemeBtn(savedTheme);

    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('netpulse-theme', theme);
            updateActiveThemeBtn(theme);
        });
    });
}

function updateActiveThemeBtn(theme) {
    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
}

// ===== PARTICLES =====
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const PARTICLE_COUNT = 50;

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.1,
            fadeSpeed: Math.random() * 0.005 + 0.002,
            growing: Math.random() > 0.5
        };
    }

    function resetParticle(p) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.size = Math.random() * 2 + 0.5;
        p.speedX = (Math.random() - 0.5) * 0.4;
        p.speedY = (Math.random() - 0.5) * 0.4;
        p.opacity = Math.random() * 0.5 + 0.1;
        p.fadeSpeed = Math.random() * 0.005 + 0.002;
        p.growing = Math.random() > 0.5;
    }

    function updateParticle(p) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.growing) {
            p.opacity += p.fadeSpeed;
            if (p.opacity >= 0.6) p.growing = false;
        } else {
            p.opacity -= p.fadeSpeed;
            if (p.opacity <= 0.05) p.growing = true;
        }

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            resetParticle(p);
        }
    }

    function drawParticle(p) {
        const style = getComputedStyle(document.documentElement);
        const color = style.getPropertyValue('--particle-color').trim() || 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, p.opacity + ')');
        ctx.fill();
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            updateParticle(p);
            drawParticle(p);
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const style = getComputedStyle(document.documentElement);
                    const color = style.getPropertyValue('--particle-color').trim() || 'rgba(56, 189, 248, 0.4)';
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = color.replace(/[\d.]+\)$/, opacity + ')');
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ===== GAUGE =====
var gaugeProgressEl;
var GAUGE_ARC_LENGTH = 314;

function initGauge() {
    gaugeProgressEl = document.getElementById('gaugeProgress');

    const svg = document.querySelector('.gauge-svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gaugeGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.style.stopColor = 'var(--accent)';

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.style.stopColor = 'var(--accent2)';

    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.style.stopColor = 'var(--operator)';

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);

    const ticksGroup = document.getElementById('gaugeTicks');
    const cx = 130, cy = 140, r = 100;
    const tickValues = [0, 25, 50, 75, 100, 150, 200, 300, 500];

    tickValues.forEach(function(val) {
        const maxVal = 500;
        const ratio = val / maxVal;
        const angle = Math.PI + ratio * Math.PI;
        const x1 = cx + (r - 8) * Math.cos(angle);
        const y1 = cy + (r - 8) * Math.sin(angle);
        const x2 = cx + (r + 2) * Math.cos(angle);
        const y2 = cy + (r + 2) * Math.sin(angle);
        const tx = cx + (r - 22) * Math.cos(angle);
        const ty = cy + (r - 22) * Math.sin(angle);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-width', '1.5');
        ticksGroup.appendChild(line);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = val;
        ticksGroup.appendChild(text);
    });

    setGaugeValue(0);
}

function setGaugeValue(value, maxValue) {
    if (maxValue === undefined) maxValue = 500;
    const ratio = Math.min(value / maxValue, 1);
    const offset = GAUGE_ARC_LENGTH * (1 - ratio);
    if (gaugeProgressEl) {
        gaugeProgressEl.style.strokeDashoffset = offset;
    }
    document.getElementById('gaugeValue').textContent = Math.round(value);
}

// ===== PHASE INDICATOR =====
function setPhase(phase) {
    const steps = document.querySelectorAll('.phase-step');
    const lines = document.querySelectorAll('.phase-line');
    const phases = ['ping', 'download', 'upload'];
    const currentIndex = phases.indexOf(phase);

    steps.forEach(function(step, i) {
        step.classList.remove('active', 'completed');
        if (i < currentIndex) {
            step.classList.add('completed');
        } else if (i === currentIndex) {
            step.classList.add('active');
        }
    });

    lines.forEach(function(line, i) {
        line.classList.remove('active');
        if (i < currentIndex) {
            line.classList.add('active');
        }
    });
}

function resetPhases() {
    document.querySelectorAll('.phase-step').forEach(function(s) { s.classList.remove('active', 'completed'); });
    document.querySelectorAll('.phase-line').forEach(function(l) { l.classList.remove('active'); });
}

function completeAllPhases() {
    document.querySelectorAll('.phase-step').forEach(function(s) {
        s.classList.remove('active');
        s.classList.add('completed');
    });
    document.querySelectorAll('.phase-line').forEach(function(l) { l.classList.add('active'); });
}

// ===== REAL SPEED TEST =====
var isTesting = false;

function initSpeedTest() {
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', function() {
        if (isTesting) return;
        runSpeedTest();
    });
}

// --- Real Ping Test ---
async function realPingTest() {
    const url = 'https://www.cloudflare.com/cdn-cgi/trace';
    const pings = [];
    const iterations = 20;

    document.getElementById('gaugeLabel').textContent = 'Testing Ping';
    document.getElementById('gaugeUnit').textContent = 'ms';
    setPhase('ping');

    for (let i = 0; i < iterations; i++) {
        try {
            const cacheBuster = '?cb=' + Date.now() + '-' + Math.random();
            const start = performance.now();
            await fetch(url + cacheBuster, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors',
            });
            const end = performance.now();
            const latency = end - start;
            pings.push(latency);
            setGaugeValue(latency, 200);
            document.getElementById('gaugeValue').textContent = latency.toFixed(1);
        } catch (e) {
            try {
                const cacheBuster = '?cb=' + Date.now() + '-' + Math.random();
                const start = performance.now();
                await fetch(url + cacheBuster, {
                    method: 'HEAD',
                    cache: 'no-store',
                    mode: 'no-cors',
                });
                const end = performance.now();
                pings.push(end - start);
                setGaugeValue(end - start, 200);
                document.getElementById('gaugeValue').textContent = (end - start).toFixed(1);
            } catch (e2) {
                // skip failed ping
            }
        }
        await sleep(100);
    }

    if (pings.length === 0) {
        return { ping: 0, jitter: 0 };
    }

    pings.sort(function(a, b) { return a - b; });
    const trimCount = Math.floor(pings.length * 0.1);
    const trimmedPings = pings.slice(trimCount, pings.length - trimCount);

    const avgPing = trimmedPings.reduce(function(a, b) { return a + b; }, 0) / trimmedPings.length;

    let jitterSum = 0;
    for (let i = 1; i < trimmedPings.length; i++) {
        jitterSum += Math.abs(trimmedPings[i] - trimmedPings[i - 1]);
    }
    const jitter = trimmedPings.length > 1 ? jitterSum / (trimmedPings.length - 1) : 0;

    return { ping: avgPing, jitter: jitter };
}

// --- Real Download Speed Test ---
async function realDownloadTest() {
    document.getElementById('gaugeLabel').textContent = 'Download';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('download');

    const testSizes = [
        { size: 1e5, label: '100KB' },
        { size: 1e6, label: '1MB' },
        { size: 5e6, label: '5MB' },
        { size: 10e6, label: '10MB' },
        { size: 25e6, label: '25MB' },
    ];

    let totalBytes = 0;
    let totalTime = 0;
    let currentSpeed = 0;
    const speedSamples = [];
    const testDuration = 10000;
    const startTime = performance.now();

    for (const test of testSizes) {
        if (performance.now() - startTime > testDuration) break;

        try {
            const url = 'https://speed.cloudflare.com/__down?bytes=' + test.size + '&cacheBuster=' + Date.now();
            const fetchStart = performance.now();

            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) throw new Error('Download failed');

            const reader = response.body.getReader();
            let receivedBytes = 0;

            while (true) {
                const result = await reader.read();
                if (result.done) break;

                receivedBytes += result.value.length;
                const elapsed = (performance.now() - fetchStart) / 1000;

                if (elapsed > 0) {
                    currentSpeed = (receivedBytes * 8) / (elapsed * 1e6);
                    setGaugeValue(currentSpeed);
                    document.getElementById('gaugeValue').textContent = currentSpeed.toFixed(1);
                }
            }

            const fetchEnd = performance.now();
            const duration = (fetchEnd - fetchStart) / 1000;

            if (duration > 0) {
                const speed = (receivedBytes * 8) / (duration * 1e6);
                speedSamples.push(speed);
                totalBytes += receivedBytes;
                totalTime += duration;
            }

            if (currentSpeed > 100 && test.size < 25e6) {
                continue;
            }

        } catch (e) {
            console.warn('Download test chunk failed:', e);
            try {
                const altUrl = 'https://speed.cloudflare.com/__down?bytes=' + Math.min(test.size, 1e6) + '&cacheBuster=' + Date.now() + '-alt';
                const fetchStart = performance.now();
                const response = await fetch(altUrl, { cache: 'no-store' });
                const blob = await response.blob();
                const fetchEnd = performance.now();
                const duration = (fetchEnd - fetchStart) / 1000;
                if (duration > 0) {
                    const speed = (blob.size * 8) / (duration * 1e6);
                    speedSamples.push(speed);
                    totalBytes += blob.size;
                    totalTime += duration;
                    currentSpeed = speed;
                    setGaugeValue(currentSpeed);
                    document.getElementById('gaugeValue').textContent = currentSpeed.toFixed(1);
                }
            } catch (e2) {
                console.warn('Alt download also failed:', e2);
            }
        }
    }

    if (speedSamples.length > 0) {
        if (speedSamples.length > 2) {
            speedSamples.sort(function(a, b) { return a - b; });
            speedSamples.shift();
        }
        const avgSpeed = speedSamples.reduce(function(a, b) { return a + b; }, 0) / speedSamples.length;
        return avgSpeed;
    }

    if (totalTime > 0) {
        return (totalBytes * 8) / (totalTime * 1e6);
    }

    return 0;
}

// --- Real Upload Speed Test ---
async function realUploadTest() {
    document.getElementById('gaugeLabel').textContent = 'Upload';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('upload');

    const testSizes = [
        1e5,
        5e5,
        1e6,
        2e6,
        5e6,
    ];

    const speedSamples = [];
    const testDuration = 10000;
    const startTime = performance.now();

    for (const size of testSizes) {
        if (performance.now() - startTime > testDuration) break;

        try {
            const data = new ArrayBuffer(size);
            const view = new Uint8Array(data);
            for (let i = 0; i < Math.min(view.length, 1024); i++) {
                view[i] = Math.floor(Math.random() * 256);
            }

            const blob = new Blob([data]);
            const url = 'https://speed.cloudflare.com/__up?cacheBuster=' + Date.now();

            const fetchStart = performance.now();
            const response = await fetch(url, {
                method: 'POST',
                body: blob,
                cache: 'no-store',
            });

            await response.text();
            const fetchEnd = performance.now();
            const duration = (fetchEnd - fetchStart) / 1000;

            if (duration > 0) {
                const speed = (size * 8) / (duration * 1e6);
                speedSamples.push(speed);

                setGaugeValue(speed);
                document.getElementById('gaugeValue').textContent = speed.toFixed(1);
            }
        } catch (e) {
            console.warn('Upload test chunk failed:', e);
            try {
                const smallSize = Math.min(size, 5e5);
                const data = new ArrayBuffer(smallSize);
                const blob = new Blob([data]);
                const url = 'https://speed.cloudflare.com/__up?cacheBuster=' + Date.now() + '-retry';

                const fetchStart = performance.now();
                await fetch(url, { method: 'POST', body: blob, cache: 'no-store' });
                const fetchEnd = performance.now();
                const duration = (fetchEnd - fetchStart) / 1000;

                if (duration > 0) {
                    const speed = (smallSize * 8) / (duration * 1e6);
                    speedSamples.push(speed);
                    setGaugeValue(speed);
                    document.getElementById('gaugeValue').textContent = speed.toFixed(1);
                }
            } catch (e2) {
                console.warn('Alt upload also failed:', e2);
            }
        }
    }

    if (speedSamples.length > 0) {
        if (speedSamples.length > 2) {
            speedSamples.sort(function(a, b) { return a - b; });
            speedSamples.shift();
        }
        return speedSamples.reduce(function(a, b) { return a + b; }, 0) / speedSamples.length;
    }

    return 0;
}

function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function runSpeedTest() {
    isTesting = true;
    const startBtn = document.getElementById('startBtn');
    startBtn.classList.add('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'TESTING...';

    document.getElementById('downloadResult').textContent = '--';
    document.getElementById('uploadResult').textContent = '--';
    document.getElementById('pingResult').textContent = '--';
    document.getElementById('jitterResult').textContent = '--';
    resetPhases();

    try {
        // Phase 1: Ping Test
        const pingResult = await realPingTest();
        document.getElementById('pingResult').textContent = pingResult.ping.toFixed(1);
        document.getElementById('jitterResult').textContent = pingResult.jitter.toFixed(1);

        await sleep(300);

        // Phase 2: Download Test
        const download = await realDownloadTest();
        document.getElementById('downloadResult').textContent = download.toFixed(2);

        await sleep(300);

        // Phase 3: Upload Test
        const upload = await realUploadTest();
        document.getElementById('uploadResult').textContent = upload.toFixed(2);

        // Done
        completeAllPhases();
        document.getElementById('gaugeLabel').textContent = 'Complete';
        document.getElementById('gaugeUnit').textContent = 'Mbps';
        setGaugeValue(download);
        document.getElementById('gaugeValue').textContent = download.toFixed(1);

        // Save to history
        saveTestResult({ download: download, upload: upload, ping: pingResult.ping, jitter: pingResult.jitter, timestamp: Date.now() });
        renderHistory();

    } catch (err) {
        document.getElementById('gaugeLabel').textContent = 'Error';
        console.error('Speed test error:', err);
        resetPhases();
    }

    isTesting = false;
    startBtn.classList.remove('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'START TEST';
}

// ===== IP INFO & WEATHER (ALL BUGS FIXED) =====

// Track if weather has been loaded with good coords
var weatherLoadedWithCoords = false;

// Helper: fetch with timeout
function fetchWithTimeout(url, options, timeoutMs) {
    if (!options) options = {};
    if (!timeoutMs) timeoutMs = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(function() { controller.abort(); }, timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
        .finally(function() { clearTimeout(timeoutId); });
}

// Start weather immediately using timezone-based coords (don't wait for IP)
function startWeatherFallback() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const defaults = getDefaultCoordsFromTimezone(tz);
    fetchWeather(defaults.lat, defaults.lon, false);
}

// ===== ROBUST IP DETECTION WITH 6 FALLBACK STRATEGIES =====
async function fetchIPInfo() {
    var ipData = null;

    // Strategy 1: Cloudflare trace (most reliable, always works, no CORS issues)
    if (!ipData) {
        try {
            const response = await fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', {}, 5000);
            if (response.ok) {
                const text = await response.text();
                const cfData = {};
                text.split('\n').forEach(function(line) {
                    const idx = line.indexOf('=');
                    if (idx > 0) {
                        cfData[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
                    }
                });
                if (cfData.ip) {
                    ipData = {
                        ip: cfData.ip,
                        isp: null,
                        city: null,
                        country: cfData.loc || null,
                        lat: null,
                        lon: null,
                        timezone: null,
                        partial: true
                    };
                }
            }
        } catch (e) {
            console.warn('Cloudflare trace failed:', e.message);
        }
    }

    // Strategy 2: ipapi.co (CORS-friendly, full info)
    if (!ipData || ipData.partial) {
        try {
            const response = await fetchWithTimeout('https://ipapi.co/json/', {}, 6000);
            if (response.ok) {
                const data = await response.json();
                if (data && data.ip && !data.error && !data.reason) {
                    ipData = {
                        ip: data.ip,
                        isp: data.org || 'Unknown',
                        city: data.city || null,
                        country: data.country_name || null,
                        lat: data.latitude,
                        lon: data.longitude,
                        timezone: data.timezone,
                        partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('ipapi.co failed:', e.message);
        }
    }

    // Strategy 3: ipwho.is (CORS-friendly, full info)
    if (!ipData || ipData.partial) {
        try {
            const response = await fetchWithTimeout('https://ipwho.is/', {}, 6000);
            if (response.ok) {
                const data = await response.json();
                if (data && data.success !== false && data.ip) {
                    ipData = {
                        ip: data.ip,
                        isp: data.connection ? data.connection.isp : 'Unknown',
                        city: data.city || null,
                        country: data.country || null,
                        lat: data.latitude,
                        lon: data.longitude,
                        timezone: data.timezone ? data.timezone.id : null,
                        partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('ipwho.is failed:', e.message);
        }
    }

    // Strategy 4: ipify.org (simple IP only, very reliable)
    if (!ipData) {
        try {
            const response = await fetchWithTimeout('https://api.ipify.org?format=json', {}, 5000);
            if (response.ok) {
                const data = await response.json();
                if (data && data.ip) {
                    ipData = {
                        ip: data.ip,
                        isp: null,
                        city: null,
                        country: null,
                        lat: null,
                        lon: null,
                        timezone: null,
                        partial: true
                    };
                }
            }
        } catch (e) {
            console.warn('ipify.org failed:', e.message);
        }
    }

    // Strategy 5: ip-api.com
    if (!ipData || ipData.partial) {
        try {
            const response = await fetchWithTimeout(
                'https://ip-api.com/json/?fields=status,message,query,isp,city,country,lat,lon,timezone',
                {},
                5000
            );
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    ipData = {
                        ip: data.query,
                        isp: data.isp || 'Unknown',
                        city: data.city || null,
                        country: data.country || null,
                        lat: data.lat,
                        lon: data.lon,
                        timezone: data.timezone,
                        partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('ip-api.com failed:', e.message);
        }
    }

    // Strategy 6: freeipapi.com
    if (!ipData || ipData.partial) {
        try {
            const response = await fetchWithTimeout('https://freeipapi.com/api/json', {}, 5000);
            if (response.ok) {
                const data = await response.json();
                if (data && data.ipAddress) {
                    ipData = {
                        ip: data.ipAddress,
                        isp: data.isp || (ipData ? ipData.isp : null) || 'Unknown',
                        city: data.cityName || (ipData ? ipData.city : null) || null,
                        country: data.countryName || (ipData ? ipData.country : null) || null,
                        lat: data.latitude || (ipData ? ipData.lat : null),
                        lon: data.longitude || (ipData ? ipData.lon : null),
                        timezone: data.timeZone || (ipData ? ipData.timezone : null),
                        partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('freeipapi.com failed:', e.message);
        }
    }

    // Update UI with whatever we got
    if (ipData) {
        document.getElementById('ipAddress').textContent = ipData.ip;
        document.getElementById('ipISP').textContent = 'ISP: ' + (ipData.isp || 'Unknown');

        const city = ipData.city || '--';
        const country = ipData.country || '--';
        if (city !== '--' || country !== '--') {
            document.getElementById('ipLocation').textContent = city + ', ' + country;
        } else {
            document.getElementById('ipLocation').textContent = 'Location: --';
        }

        document.getElementById('serverName').textContent = 'Cloudflare CDN (' + (city !== '--' ? city : 'Auto') + ')';

        // Update weather with better coordinates if available
        if (ipData.lat && ipData.lon && !weatherLoadedWithCoords) {
            fetchWeather(ipData.lat, ipData.lon, true);
        }
    } else {
        // All strategies failed
        document.getElementById('ipAddress').textContent = 'Could not detect';
        document.getElementById('ipISP').textContent = 'ISP: --';
        document.getElementById('ipLocation').textContent = 'Location: --';

        // Try browser geolocation for weather as last resort
        tryBrowserGeolocation();
    }
}

// Try browser geolocation API for weather coordinates
function tryBrowserGeolocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                if (!weatherLoadedWithCoords) {
                    fetchWeather(position.coords.latitude, position.coords.longitude, true);
                }
            },
            function() {
                console.warn('Geolocation denied or failed');
            },
            { timeout: 5000 }
        );
    }
}

// Get approximate coordinates from timezone
function getDefaultCoordsFromTimezone(tz) {
    const tzCoords = {
        'Asia/Jakarta': { lat: -6.2, lon: 106.8 },
        'Asia/Makassar': { lat: -5.1, lon: 119.4 },
        'Asia/Jayapura': { lat: -2.5, lon: 140.7 },
        'Asia/Pontianak': { lat: -0.02, lon: 109.3 },
        'Asia/Singapore': { lat: 1.35, lon: 103.8 },
        'Asia/Kuala_Lumpur': { lat: 3.1, lon: 101.7 },
        'Asia/Bangkok': { lat: 13.7, lon: 100.5 },
        'Asia/Ho_Chi_Minh': { lat: 10.8, lon: 106.6 },
        'Asia/Manila': { lat: 14.6, lon: 121.0 },
        'Asia/Tokyo': { lat: 35.7, lon: 139.7 },
        'Asia/Seoul': { lat: 37.6, lon: 127.0 },
        'Asia/Shanghai': { lat: 31.2, lon: 121.5 },
        'Asia/Hong_Kong': { lat: 22.3, lon: 114.2 },
        'Asia/Taipei': { lat: 25.0, lon: 121.5 },
        'Asia/Kolkata': { lat: 28.6, lon: 77.2 },
        'Asia/Dubai': { lat: 25.2, lon: 55.3 },
        'Asia/Riyadh': { lat: 24.7, lon: 46.7 },
        'Europe/London': { lat: 51.5, lon: -0.1 },
        'Europe/Paris': { lat: 48.9, lon: 2.3 },
        'Europe/Berlin': { lat: 52.5, lon: 13.4 },
        'Europe/Moscow': { lat: 55.8, lon: 37.6 },
        'Europe/Istanbul': { lat: 41.0, lon: 29.0 },
        'America/New_York': { lat: 40.7, lon: -74.0 },
        'America/Chicago': { lat: 41.9, lon: -87.6 },
        'America/Denver': { lat: 39.7, lon: -105.0 },
        'America/Los_Angeles': { lat: 34.1, lon: -118.2 },
        'America/Sao_Paulo': { lat: -23.5, lon: -46.6 },
        'America/Mexico_City': { lat: 19.4, lon: -99.1 },
        'Australia/Sydney': { lat: -33.9, lon: 151.2 },
        'Australia/Melbourne': { lat: -37.8, lon: 145.0 },
        'Pacific/Auckland': { lat: -36.8, lon: 174.8 },
        'Africa/Cairo': { lat: 30.0, lon: 31.2 },
        'Africa/Lagos': { lat: 6.5, lon: 3.4 },
    };

    if (tz && tzCoords[tz]) {
        return tzCoords[tz];
    }

    // Try partial match
    var keys = Object.keys(tzCoords);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (tz && tz.includes(key.split('/')[1])) {
            return tzCoords[key];
        }
    }

    // Default to Jakarta
    return { lat: -6.2, lon: 106.8 };
}

async function fetchWeather(lat, lon, isAccurateCoords) {
    // If we already have weather from accurate coords, don't overwrite with fallback
    if (weatherLoadedWithCoords && !isAccurateCoords) return;

    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';
        const response = await fetchWithTimeout(url, {}, 8000);

        if (!response.ok) throw new Error('Weather API returned ' + response.status);

        const data = await response.json();

        if (data && data.current) {
            const temp = data.current.temperature_2m;
            const humidity = data.current.relative_humidity_2m;
            const windSpeed = data.current.wind_speed_10m;
            const weatherCode = data.current.weather_code;

            document.getElementById('weatherTemp').textContent = Math.round(temp) + '\u00B0C';
            document.getElementById('weatherDesc').textContent = getWeatherDescription(weatherCode);
            document.getElementById('weatherEmoji').textContent = getWeatherEmoji(weatherCode);
            document.getElementById('weatherHumidity').innerHTML =
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> ' +
                humidity + '%';
            document.getElementById('weatherWind').innerHTML =
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg> ' +
                windSpeed + ' km/h';

            if (isAccurateCoords) {
                weatherLoadedWithCoords = true;
            }
        } else {
            throw new Error('No current weather data in response');
        }
    } catch (err) {
        console.error('Weather fetch error:', err);
        // Only show error if we haven't loaded weather yet
        if (!weatherLoadedWithCoords) {
            document.getElementById('weatherDesc').textContent = 'Weather unavailable';
            document.getElementById('weatherEmoji').textContent = '\u2753';
            document.getElementById('weatherTemp').textContent = '--\u00B0C';
        }
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
        82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}

function getWeatherEmoji(code) {
    if (code === 0) return '\u2600\uFE0F';
    if (code <= 2) return '\u26C5';
    if (code === 3) return '\u2601\uFE0F';
    if (code <= 48) return '\uD83C\uDF2B\uFE0F';
    if (code <= 57) return '\uD83C\uDF26\uFE0F';
    if (code <= 67) return '\uD83C\uDF27\uFE0F';
    if (code <= 77) return '\uD83C\uDF28\uFE0F';
    if (code <= 82) return '\uD83C\uDF27\uFE0F';
    if (code <= 86) return '\uD83C\uDF28\uFE0F';
    if (code >= 95) return '\u26C8\uFE0F';
    return '\uD83C\uDF24\uFE0F';
}

// ===== HISTORY =====
var HISTORY_KEY = 'netpulse-history';

function initHistory() {
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const historyClose = document.getElementById('historyClose');
    const historyClear = document.getElementById('historyClear');

    historyBtn.addEventListener('click', function() {
        historyPanel.classList.toggle('open');
    });

    historyClose.addEventListener('click', function() {
        historyPanel.classList.remove('open');
    });

    historyClear.addEventListener('click', function() {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    });

    document.addEventListener('click', function(e) {
        if (historyPanel.classList.contains('open') &&
            !historyPanel.contains(e.target) &&
            !document.getElementById('historyBtn').contains(e.target)) {
            historyPanel.classList.remove('open');
        }
    });

    renderHistory();
}

function saveTestResult(result) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift(result);
    if (history.length > 20) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    const existingItems = historyList.querySelectorAll('.history-item');
    existingItems.forEach(function(item) { item.remove(); });

    if (history.length === 0) {
        historyEmpty.style.display = 'flex';
        return;
    }

    historyEmpty.style.display = 'none';

    history.forEach(function(result) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(result.timestamp);
        const timeStr = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        var jitterHtml = '';
        if (result.jitter !== undefined) {
            jitterHtml = '<div class="history-stat">' +
                '<span class="history-stat-label">Jitter</span>' +
                '<span class="history-stat-value jitter-val">' + result.jitter.toFixed(1) + '</span>' +
                '</div>';
        }

        item.innerHTML =
            '<div class="history-item-time">' + timeStr + '</div>' +
            '<div class="history-item-results">' +
                '<div class="history-stat">' +
                    '<span class="history-stat-label">Download</span>' +
                    '<span class="history-stat-value">' + result.download.toFixed(1) + '</span>' +
                '</div>' +
                '<div class="history-stat">' +
                    '<span class="history-stat-label">Upload</span>' +
                    '<span class="history-stat-value upload-val">' + result.upload.toFixed(1) + '</span>' +
                '</div>' +
                '<div class="history-stat">' +
                    '<span class="history-stat-label">Ping</span>' +
                    '<span class="history-stat-value ping-val">' + result.ping.toFixed(1) + '</span>' +
                '</div>' +
                jitterHtml +
            '</div>';

        historyList.appendChild(item);
    });
}
