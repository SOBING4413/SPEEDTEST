// ===== NetPulse Speed Test =====

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
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const PARTICLE_COUNT = 40;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
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

        // Draw connections
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

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

// ===== GAUGE =====
let gaugeProgressEl;
const GAUGE_ARC_LENGTH = 314; // Approximate arc length for the semicircle

function initGauge() {
    gaugeProgressEl = document.getElementById('gaugeProgress');

    // Add SVG gradient definition
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
    stop1.setAttribute('class', 'gauge-stop-1');
    stop1.style.stopColor = 'var(--accent)';

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('class', 'gauge-stop-2');
    stop2.style.stopColor = 'var(--accent2)';

    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('class', 'gauge-stop-3');
    stop3.style.stopColor = 'var(--operator)';

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);

    // Add tick marks
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

// ===== SPEED TEST =====
let isTesting = false;

function initSpeedTest() {
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        if (isTesting) return;
        runSpeedTest();
    });
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

    try {
        // Phase 1: Ping Test
        document.getElementById('gaugeLabel').textContent = 'Testing Ping';
        document.getElementById('gaugeUnit').textContent = 'ms';
        const ping = await simulatePingTest();
        document.getElementById('pingResult').textContent = ping.toFixed(1);

        // Phase 2: Download Test
        document.getElementById('gaugeLabel').textContent = 'Download';
        document.getElementById('gaugeUnit').textContent = 'Mbps';
        const download = await simulateSpeedTest('download');
        document.getElementById('downloadResult').textContent = download.toFixed(2);

        // Phase 3: Upload Test
        document.getElementById('gaugeLabel').textContent = 'Upload';
        const upload = await simulateSpeedTest('upload');
        document.getElementById('uploadResult').textContent = upload.toFixed(2);

        // Done
        document.getElementById('gaugeLabel').textContent = 'Complete';
        document.getElementById('gaugeUnit').textContent = 'Mbps';
        setGaugeValue(download);

        // Save to history
        saveTestResult({ download, upload, ping, timestamp: Date.now() });
        renderHistory();

    } catch (err) {
        document.getElementById('gaugeLabel').textContent = 'Error';
        console.error('Speed test error:', err);
    }

    isTesting = false;
    startBtn.classList.remove('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'START TEST';
}

function simulatePingTest() {
    return new Promise((resolve) => {
        let elapsed = 0;
        const duration = 2000;
        const targetPing = 5 + Math.random() * 45; // 5-50ms
        const interval = setInterval(() => {
            elapsed += 50;
            const progress = elapsed / duration;
            const currentPing = targetPing * (0.5 + Math.random() * 0.5);
            setGaugeValue(currentPing, 100);
            document.getElementById('gaugeValue').textContent = currentPing.toFixed(1);

            if (elapsed >= duration) {
                clearInterval(interval);
                setGaugeValue(targetPing, 100);
                resolve(targetPing);
            }
        }, 50);
    });
}

function simulateSpeedTest(type) {
    return new Promise((resolve) => {
        let elapsed = 0;
        const duration = 4000;
        const maxSpeed = type === 'download'
            ? 50 + Math.random() * 200  // 50-250 Mbps
            : 20 + Math.random() * 80;  // 20-100 Mbps

        // Create realistic speed curve
        const rampUp = duration * 0.3;
        const stable = duration * 0.5;
        let lastSpeed = 0;

        const interval = setInterval(() => {
            elapsed += 50;
            const progress = elapsed / duration;
            let speed;

            if (elapsed < rampUp) {
                // Ramp up phase
                const rampProgress = elapsed / rampUp;
                speed = maxSpeed * easeOutCubic(rampProgress) * (0.8 + Math.random() * 0.4);
            } else if (elapsed < rampUp + stable) {
                // Stable phase with fluctuations
                speed = maxSpeed * (0.85 + Math.random() * 0.3);
            } else {
                // Final phase
                speed = maxSpeed * (0.9 + Math.random() * 0.2);
            }

            // Smooth the value
            speed = lastSpeed * 0.3 + speed * 0.7;
            lastSpeed = speed;

            setGaugeValue(speed);
            document.getElementById('gaugeValue').textContent = speed.toFixed(1);

            if (elapsed >= duration) {
                clearInterval(interval);
                const finalSpeed = maxSpeed * (0.9 + Math.random() * 0.1);
                setGaugeValue(finalSpeed);
                resolve(finalSpeed);
            }
        }, 50);
    });
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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
            document.getElementById('serverName').textContent = `${data.city || 'Auto'} - ${data.isp || 'detect'}`;

            // Fetch weather with coordinates
            if (data.lat && data.lon) {
                fetchWeather(data.lat, data.lon);
            }
        } else {
            document.getElementById('ipAddress').textContent = 'Unavailable';
        }
    } catch (err) {
        console.error('IP fetch error:', err);
        document.getElementById('ipAddress').textContent = 'Unavailable';
        // Try weather with default location
        fetchWeather(-6.2, 106.8); // Jakarta default
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
    if (code <= 82 return '🌧️';
    icode <= 86) return '🌨️';
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

    // Close on outside click
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
    // Keep max 20 results
    if (history.length > 20) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    // Clear existing items (keep empty state)
    const existingItems = historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    if (history.length === 0) {
        historyEmpty.style.display = 'flex';
        return;
    }

    historyEmpty.style.display = 'none';

    histoy.forEach(result => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(result.timestamp);
        const timeStr = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

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
            </div>
        `;

        historyList.appendChild(item);
    });
}