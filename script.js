// ===== NetPulse Real Speed Test =====

document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initThemeSwitcher();
    initParticles();
    initGauge();
    initSpeedTest();
    initHistory();
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

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('netpulse-theme', theme);
            updateActiveThemeBtn(theme);
        });
    });
}

function updateActiveThemeBtn(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
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

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.growing = Math.random() > 0.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.growing) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 0.6) this.growing = false;
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0.05) this.growing = true;
            }

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            const style = getComputedStyle(document.documentElement);
            const color = style.getPropertyValue('--particle-color').trim() || 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(/[\d.]+\)$/, `${this.opacity})`);
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
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
                    ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${opacity})`);
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
let gaugeProgressEl;
const GAUGE_ARC_LENGTH = 314;

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

    tickValues.forEach(val => {
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

function setGaugeValue(value, maxValue = 500) {
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

    steps.forEach((step, i) => {
        step.classList.remove('active', 'completed');
        if (i < currentIndex) {
            step.classList.add('completed');
        } else if (i === currentIndex) {
            step.classList.add('active');
        }
    });

    lines.forEach((line, i) => {
        line.classList.remove('active');
        if (i < currentIndex) {
            line.classList.add('active');
        }
    });
}

function resetPhases() {
    document.querySelectorAll('.phase-step').forEach(s => s.classList.remove('active', 'completed'));
    document.querySelectorAll('.phase-line').forEach(l => l.classList.remove('active'));
}

function completeAllPhases() {
    document.querySelectorAll('.phase-step').forEach(s => {
        s.classList.remove('active');
        s.classList.add('completed');
    });
    document.querySelectorAll('.phase-line').forEach(l => l.classList.add('active'));
}

// ===== REAL SPEED TEST =====
let isTesting = false;

function initSpeedTest() {
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        if (isTesting) return;
        runSpeedTest();
    });
}

// --- Real Ping Test ---
// Measures actual HTTP round-trip time to Cloudflare's edge
async function realPingTest() {
    const url = 'https://www.cloudflare.com/cdn-cgi/trace';
    const pings = [];
    const iterations = 20;

    document.getElementById('gaugeLabel').textContent = 'Testing Ping';
    document.getElementById('gaugeUnit').textContent = 'ms';
    setPhase('ping');

    for (let i = 0; i < iterations; i++) {
        try {
            const cacheBuster = `?cb=${Date.now()}-${Math.random()}`;
            const start = performance.now();
            await fetch(url + cacheBuster, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors',
            });
            const end = performance.now();
            const latency = end - start;
            pings.push(latency);

            // Update gauge in realtime
            setGaugeValue(latency, 200);
            document.getElementById('gaugeValue').textContent = latency.toFixed(1);
        } catch (e) {
            // If CORS fails, try with no-cors (less accurate but works)
            try {
                const cacheBuster = `?cb=${Date.now()}-${Math.random()}`;
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
        // Small delay between pings
        await sleep(100);
    }

    if (pings.length === 0) {
        return { ping: 0, jitter: 0 };
    }

    // Remove outliers (top and bottom 10%)
    pings.sort((a, b) => a - b);
    const trimCount = Math.floor(pings.length * 0.1);
    const trimmedPings = pings.slice(trimCount, pings.length - trimCount);

    const avgPing = trimmedPings.reduce((a, b) => a + b, 0) / trimmedPings.length;

    // Calculate jitter (average difference between consecutive pings)
    let jitterSum = 0;
    for (let i = 1; i < trimmedPings.length; i++) {
        jitterSum += Math.abs(trimmedPings[i] - trimmedPings[i - 1]);
    }
    const jitter = trimmedPings.length > 1 ? jitterSum / (trimmedPings.length - 1) : 0;

    return { ping: avgPing, jitter: jitter };
}

// --- Real Download Speed Test ---
// Downloads data from Cloudflare's speed test endpoint and measures throughput
async function realDownloadTest() {
    document.getElementById('gaugeLabel').textContent = 'Download';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('download');

    // Use multiple file sizes for progressive testing
    // Cloudflare speed test uses their __down endpoint
    const testSizes = [
        { size: 1e5, label: '100KB' },    // 100KB warmup
        { size: 1e6, label: '1MB' },      // 1MB
        { size: 5e6, label: '5MB' },      // 5MB
        { size: 10e6, label: '10MB' },    // 10MB
        { size: 25e6, label: '25MB' },    // 25MB
    ];

    let totalBytes = 0;
    let totalTime = 0;
    let currentSpeed = 0;
    const speedSamples = [];
    const testDuration = 10000; // 10 seconds max
    const startTime = performance.now();

    for (const test of testSizes) {
        if (performance.now() - startTime > testDuration) break;

        try {
            const url = `https://speed.cloudflare.com/__down?bytes=${test.size}&cacheBuster=${Date.now()}`;
            const fetchStart = performance.now();

            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) throw new Error('Download failed');

            const reader = response.body.getReader();
            let receivedBytes = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                receivedBytes += value.length;
                const elapsed = (performance.now() - fetchStart) / 1000; // seconds

                if (elapsed > 0) {
                    // Calculate current speed in Mbps
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

            // Run larger tests multiple times if connection is fast
            if (currentSpeed > 100 && test.size < 25e6) {
                continue; // Skip to larger file
            }

        } catch (e) {
            console.warn('Download test chunk failed:', e);
            // Try alternative download source
            try {
                const altUrl = `https://speed.cloudflare.com/__down?bytes=${Math.min(test.size, 1e6)}&cacheBuster=${Date.now()}-alt`;
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

    // If we got samples, calculate weighted average
    if (speedSamples.length > 0) {
        // Remove lowest sample (warmup) if we have enough
        if (speedSamples.length > 2) {
            speedSamples.sort((a, b) => a - b);
            speedSamples.shift(); // remove lowest
        }
        const avgSpeed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
        return avgSpeed;
    }

    // Fallback: calculate from total
    if (totalTime > 0) {
        return (totalBytes * 8) / (totalTime * 1e6);
    }

    return 0;
}

// --- Real Upload Speed Test ---
// Uploads data to Cloudflare's speed test endpoint and measures throughput
async function realUploadTest() {
    document.getElementById('gaugeLabel').textContent = 'Upload';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('upload');

    const testSizes = [
        1e5,   // 100KB warmup
        5e5,   // 500KB
        1e6,   // 1MB
        2e6,   // 2MB
        5e6,   // 5MB
    ];

    const speedSamples = [];
    const testDuration = 10000; // 10 seconds max
    const startTime = performance.now();

    for (const size of testSizes) {
        if (performance.now() - startTime > testDuration) break;

        try {
            // Generate random data to upload
            const data = new ArrayBuffer(size);
            const view = new Uint8Array(data);
            // Fill with random-ish data (crypto.getRandomValues is slow for large buffers)
            for (let i = 0; i < Math.min(view.length, 1024); i++) {
                view[i] = Math.floor(Math.random() * 256);
            }

            const blob = new Blob([data]);
            const url = `https://speed.cloudflare.com/__up?cacheBuster=${Date.now()}`;

            const fetchStart = performance.now();
            const response = await fetch(url, {
                method: 'POST',
                body: blob,
                cache: 'no-store',
            });

            // Read the response to ensure upload is complete
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
            // Try with smaller payload
            try {
                const smallSize = Math.min(size, 5e5);
                const data = new ArrayBuffer(smallSize);
                const blob = new Blob([data]);
                const url = `https://speed.cloudflare.com/__up?cacheBuster=${Date.now()}-retry`;

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
            speedSamples.sort((a, b) => a - b);
            speedSamples.shift();
        }
        return speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
    }

    return 0;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSpeedTest() {
    isTesting = true;
    const startBtn = document.getElementById('startBtn');
    startBtn.classList.add('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'TESTING...';

    // Reset results
    document.getElementById('downloadResult').textContent = '--';
    document.getElementById('uploadResult').textContent = '--';
    document.getElementById('pingResult').textContent = '--';
    document.getElementById('jitterResult').textContent = '--';
    resetPhases();

    try {
        // Phase 1: Ping Test (real)
        const { ping, jitter } = await realPingTest();
        document.getElementById('pingResult').textContent = ping.toFixed(1);
        document.getElementById('jitterResult').textContent = jitter.toFixed(1);

        await sleep(300);

        // Phase 2: Download Test (real)
        const download = await realDownloadTest();
        document.getElementById('downloadResult').textContent = download.toFixed(2);

        await sleep(300);

        // Phase 3: Upload Test (real)
        const upload = await realUploadTest();
        document.getElementById('uploadResult').textContent = upload.toFixed(2);

        // Done
        completeAllPhases();
        document.getElementById('gaugeLabel').textContent = 'Complete';
        document.getElementById('gaugeUnit').textContent = 'Mbps';
        setGaugeValue(download);
        document.getElementById('gaugeValue').textContent = download.toFixed(1);

        // Save to history
        saveTestResult({ download, upload, ping, jitter, timestamp: Date.now() });
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

// ===== IP INFO & WEATHER =====
async function fetchIPInfo() {
    try {
        const response = await fetch('https://ip-api.com/json/?fields=status,message,query,isp,city,country,lat,lon,timezone');
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('ipAddress').textContent = data.query;
            document.getElementById('ipISP').textContent = `ISP: ${data.isp || 'Unknown'}`;
            document.getElementById('ipLocation').textContent = `${data.city || '--'}, ${data.country || '--'}`;
            document.getElementById('serverName').textContent = `Cloudflare CDN (${data.city || 'Auto'})`;

            if (data.lat && data.lon) {
                fetchWeather(data.lat, data.lon);
            }
        } else {
            document.getElementById('ipAddress').textContent = 'Unavailable';
        }
    } catch (err) {
        console.error('IP fetch error:', err);
        document.getElementById('ipAddress').textContent = 'Unavailable';
        fetchWeather(-6.2, 106.8);
    }
}

async function fetchWeather(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.current) {
            const temp = data.current.temperature_2m;
            const humidity = data.current.relative_humidity_2m;
            const windSpeed = data.current.wind_speed_10m;
            const weatherCode = data.current.weather_code;

            document.getElementById('weatherTemp').textContent = `${Math.round(temp)}°C`;
            document.getElementById('weatherDesc').textContent = getWeatherDescription(weatherCode);
            document.getElementById('weatherEmoji').textContent = getWeatherEmoji(weatherCode);
            document.getElementById('weatherHumidity').innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                ${humidity}%
            `;
            document.getElementById('weatherWind').innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                ${windSpeed} km/h
            `;
        }
    } catch (err) {
        console.error('Weather fetch error:', err);
        document.getElementById('weatherDesc').textContent = 'Weather unavailable';
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
        82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}

function getWeatherEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code === 3) return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌤️';
}

// ===== HISTORY =====
const HISTORY_KEY = 'netpulse-history';

function initHistory() {
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const historyClose = document.getElementById('historyClose');
    const historyClear = document.getElementById('historyClear');

    historyBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('open');
    });

    historyClose.addEventListener('click', () => {
        historyPanel.classList.remove('open');
    });

    historyClear.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    });

    document.addEventListener('click', (e) => {
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
    existingItems.forEach(item => item.remove());

    if (history.length === 0) {
        historyEmpty.style.display = 'flex';
        return;
    }

    historyEmpty.style.display = 'none';

    history.forEach(result => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(result.timestamp);
        const timeStr = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const jitterHtml = result.jitter !== undefined
            ? `<div class="history-stat">
                    <span class="history-stat-label">Jitter</span>
                    <span class="history-stat-value jitter-val">${result.jitter.toFixed(1)}</span>
                </div>`
            : '';

        item.innerHTML = `
            <div class="history-item-time">${timeStr}</div>
            <div class="history-item-results">
                <div class="history-stat">
                    <span class="history-stat-label">Download</span>
                    <span class="history-stat-value">${result.download.toFixed(1)}</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">Upload</span>
                    <span class="history-stat-value upload-val">${result.upload.toFixed(1)}</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">Ping</span>
                    <span class="history-stat-value ping-val">${result.ping.toFixed(1)}</span>
                </div>
                ${jitterHtml}
            </div>
        `;

        historyList.appendChild(item);
    });
}
