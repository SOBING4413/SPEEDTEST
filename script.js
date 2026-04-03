// ===== NetPulse Real Speed Test - Enhanced with Live Graph & Extended Duration =====

document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initThemeSwitcher();
    initParticles();
    initGauge();
    initSpeedTest();
    initHistory();
    startWeatherFallback();
    fetchIPInfo();
});

var APP_CONFIG = {
    graph: {
        maxPoints: 100,
    },
    particles: {
        mobileBreakpoint: 768,
        count: 50,
        connectionDistance: 120,
    },
    speedTest: {
        maxGaugeMbps: 500,
        pingGaugeMaxMs: 200,
        pingIterations: 30,
        pingDelayMs: 120,
        interPhaseDelayMs: 300,
        postTestHideProgressDelayMs: 2000,
        testDurationMs: {
            download: 12000,
            upload: 12000,
        },
        downloadSizes: [1e5, 5e5, 1e6, 5e6, 10e6, 25e6, 25e6, 25e6],
        uploadSizes: [1e5, 5e5, 1e6, 2e6, 5e6, 5e6, 5e6],
        maxHistoryItems: 20,
    },
    network: {
        timeoutMs: {
            default: 5000,
            weather: 8000,
            ipapi: 6000,
            ipwho: 6000,
        },
    },
};

// ===== CLOCK =====
function initClock() {
    function updateClock() {
        var now = new Date();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('clockTime').textContent = hours + ':' + minutes + ':' + seconds;

        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', options);

        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var tzShort = tz.split('/').pop().replace(/_/g, ' ');
        document.getElementById('tzBadge').textContent = tzShort;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// ===== THEME SWITCHER =====
function initThemeSwitcher() {
    var savedTheme = localStorage.getItem('netpulse-theme') || 'cyber';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateActiveThemeBtn(savedTheme);

    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var theme = btn.getAttribute('data-theme');
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
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    var isMobile = window.innerWidth <= APP_CONFIG.particles.mobileBreakpoint;
    if (isMobile) return;

    var PARTICLE_COUNT = APP_CONFIG.particles.count;

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
        var style = getComputedStyle(document.documentElement);
        var color = style.getPropertyValue('--particle-color').trim() || 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, p.opacity + ')');
        ctx.fill();
    }

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            updateParticle(p);
            drawParticle(p);
        });

        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < APP_CONFIG.particles.connectionDistance) {
                    var style = getComputedStyle(document.documentElement);
                    var color = style.getPropertyValue('--particle-color').trim() || 'rgba(56, 189, 248, 0.4)';
                    var opacity = (1 - dist / APP_CONFIG.particles.connectionDistance) * 0.15;
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

    var svg = document.querySelector('.gauge-svg');
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    var gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gaugeGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.style.stopColor = 'var(--accent)';

    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.style.stopColor = 'var(--accent2)';

    var stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.style.stopColor = 'var(--operator)';

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);

    var ticksGroup = document.getElementById('gaugeTicks');
    var cx = 130, cy = 140, r = 100;
    var tickValues = [0, 25, 50, 75, 100, 150, 200, 300, 500];

    tickValues.forEach(function(val) {
        var maxVal = 500;
        var ratio = val / maxVal;
        var angle = Math.PI + ratio * Math.PI;
        var x1 = cx + (r - 8) * Math.cos(angle);
        var y1 = cy + (r - 8) * Math.sin(angle);
        var x2 = cx + (r + 2) * Math.cos(angle);
        var y2 = cy + (r + 2) * Math.sin(angle);
        var tx = cx + (r - 22) * Math.cos(angle);
        var ty = cy + (r - 22) * Math.sin(angle);

        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-width', '1.5');
        ticksGroup.appendChild(line);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
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
    if (maxValue === undefined) maxValue = APP_CONFIG.speedTest.maxGaugeMbps;
    var ratio = Math.min(value / maxValue, 1);
    var offset = GAUGE_ARC_LENGTH * (1 - ratio);
    if (gaugeProgressEl) {
        gaugeProgressEl.style.strokeDashoffset = offset;
    }
    document.getElementById('gaugeValue').textContent = Math.round(value);
}

// ===== PHASE INDICATOR =====
function setPhase(phase) {
    var steps = document.querySelectorAll('.phase-step');
    var lines = document.querySelectorAll('.phase-line');
    var phases = ['ping', 'download', 'upload'];
    var currentIndex = phases.indexOf(phase);

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

// ===== LIVE GRAPH =====
var graphData = [];
var graphMaxPoints = APP_CONFIG.graph.maxPoints;

function showGraph() {
    var section = document.getElementById('liveGraphSection');
    if (section) section.classList.add('visible');
    graphData = [];
}

function hideGraph() {
    var section = document.getElementById('liveGraphSection');
    if (section) section.classList.remove('visible');
}

function addGraphPoint(value) {
    graphData.push(value);
    if (graphData.length > graphMaxPoints) {
        graphData.shift();
    }
    drawGraph();
}

function drawGraph() {
    var canvas = document.getElementById('liveGraphCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (graphData.length < 2) return;

    var maxVal = Math.max.apply(null, graphData) * 1.2;
    if (maxVal === 0) maxVal = 1;

    var style = getComputedStyle(document.documentElement);
    var accentColor = style.getPropertyValue('--accent').trim() || '#38bdf8';
    var accentRgb = style.getPropertyValue('--accent-rgb').trim() || '56, 189, 248';

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var i = 0; i < graphData.length; i++) {
        var x = (i / (graphMaxPoints - 1)) * w;
        var y = h - (graphData[i] / maxVal) * (h - 10);
        ctx.lineTo(x, y);
    }
    var lastX = ((graphData.length - 1) / (graphMaxPoints - 1)) * w;
    ctx.lineTo(lastX, h);
    ctx.closePath();

    var gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(' + accentRgb + ', 0.3)');
    gradient.addColorStop(1, 'rgba(' + accentRgb + ', 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    for (var i = 0; i < graphData.length; i++) {
        var x = (i / (graphMaxPoints - 1)) * w;
        var y = h - (graphData[i] / maxVal) * (h - 10);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw current point
    if (graphData.length > 0) {
        var lastIdx = graphData.length - 1;
        var px = (lastIdx / (graphMaxPoints - 1)) * w;
        var py = h - (graphData[lastIdx] / maxVal) * (h - 10);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ===== PROGRESS BAR =====
var testStartTime = 0;
var totalTestDuration =
    APP_CONFIG.speedTest.testDurationMs.download +
    APP_CONFIG.speedTest.testDurationMs.upload +
    APP_CONFIG.speedTest.pingIterations * APP_CONFIG.speedTest.pingDelayMs;

function showProgressBar() {
    var bar = document.getElementById('testProgressBar');
    if (bar) bar.classList.add('visible');
    testStartTime = performance.now();
}

function hideProgressBar() {
    var bar = document.getElementById('testProgressBar');
    if (bar) bar.classList.remove('visible');
}

function updateProgress(elapsed, total) {
    var percent = Math.min((elapsed / total) * 100, 100);
    var fill = document.getElementById('progressFill');
    var timeEl = document.getElementById('progressTime');
    var percentEl = document.getElementById('progressPercent');

    if (fill) fill.style.width = percent + '%';
    if (timeEl) timeEl.textContent = Math.floor(elapsed / 1000) + 's';
    if (percentEl) percentEl.textContent = Math.round(percent) + '%';
}

// ===== REAL SPEED TEST =====
var isTesting = false;

function initSpeedTest() {
    var startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', function() {
        if (isTesting) return;
        runSpeedTest();
    });
}

// --- Real Ping Test (Extended: 30 iterations) ---
async function realPingTest() {
    var url = 'https://www.cloudflare.com/cdn-cgi/trace';
    var pings = [];
    var iterations = APP_CONFIG.speedTest.pingIterations;

    document.getElementById('gaugeLabel').textContent = 'Testing Ping';
    document.getElementById('gaugeUnit').textContent = 'ms';
    setPhase('ping');

    // Add glow to ping icon
    var pingIcon = document.querySelector('.ping-icon');
    var jitterIcon = document.querySelector('.jitter-icon');
    if (pingIcon) pingIcon.classList.add('glow');
    if (jitterIcon) jitterIcon.classList.add('glow');

    for (var i = 0; i < iterations; i++) {
        try {
            var cacheBuster = '?cb=' + Date.now() + '-' + Math.random();
            var start = performance.now();
            await fetch(url + cacheBuster, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors',
            });
            var end = performance.now();
            var latency = end - start;
            pings.push(latency);
            setGaugeValue(latency, APP_CONFIG.speedTest.pingGaugeMaxMs);
            document.getElementById('gaugeValue').textContent = latency.toFixed(1);

            // Update ping result in real-time
            if (pings.length > 2) {
                var sortedPings = pings.slice().sort(function(a, b) { return a - b; });
                var trimCount = Math.floor(sortedPings.length * 0.1);
                var trimmedPings = sortedPings.slice(trimCount, sortedPings.length - trimCount);
                var currentAvg = trimmedPings.reduce(function(a, b) { return a + b; }, 0) / trimmedPings.length;
                document.getElementById('pingResult').textContent = currentAvg.toFixed(1);

                var jSum = 0;
                for (var j = 1; j < trimmedPings.length; j++) {
                    jSum += Math.abs(trimmedPings[j] - trimmedPings[j - 1]);
                }
                var currentJitter = trimmedPings.length > 1 ? jSum / (trimmedPings.length - 1) : 0;
                document.getElementById('jitterResult').textContent = currentJitter.toFixed(1);
            }

            updateProgress(performance.now() - testStartTime, totalTestDuration);
        } catch (e) {
            try {
                var cacheBuster2 = '?cb=' + Date.now() + '-' + Math.random();
                var start2 = performance.now();
                await fetch(url + cacheBuster2, {
                    method: 'HEAD',
                    cache: 'no-store',
                    mode: 'no-cors',
                });
                var end2 = performance.now();
                pings.push(end2 - start2);
                setGaugeValue(end2 - start2, APP_CONFIG.speedTest.pingGaugeMaxMs);
                document.getElementById('gaugeValue').textContent = (end2 - start2).toFixed(1);
            } catch (e2) {
                // skip failed ping
            }
        }
        await sleep(APP_CONFIG.speedTest.pingDelayMs);
    }

    if (pingIcon) pingIcon.classList.remove('glow');
    if (jitterIcon) jitterIcon.classList.remove('glow');

    if (pings.length === 0) {
        return { ping: 0, jitter: 0 };
    }

    pings.sort(function(a, b) { return a - b; });
    var trimCount = Math.floor(pings.length * 0.1);
    var trimmedPings = pings.slice(trimCount, pings.length - trimCount);

    var avgPing = trimmedPings.reduce(function(a, b) { return a + b; }, 0) / trimmedPings.length;

    var jitterSum = 0;
    for (var k = 1; k < trimmedPings.length; k++) {
        jitterSum += Math.abs(trimmedPings[k] - trimmedPings[k - 1]);
    }
    var jitter = trimmedPings.length > 1 ? jitterSum / (trimmedPings.length - 1) : 0;

    return { ping: avgPing, jitter: jitter };
}

// --- Real Download Speed Test (Extended to ~12s) ---
async function realDownloadTest() {
    document.getElementById('gaugeLabel').textContent = 'Download';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('download');
    showGraph();
    document.getElementById('graphLabel').textContent = 'Download speed over time';

    var downloadIcon = document.querySelector('.download-icon');
    if (downloadIcon) downloadIcon.classList.add('glow');

    var testSizes = APP_CONFIG.speedTest.downloadSizes;

    var totalBytes = 0;
    var totalTime = 0;
    var currentSpeed = 0;
    var speedSamples = [];
    var testDuration = APP_CONFIG.speedTest.testDurationMs.download;
    var startTime = performance.now();

    for (var t = 0; t < testSizes.length; t++) {
        var testSize = testSizes[t];
        if (performance.now() - startTime > testDuration) break;

        try {
            var url = 'https://speed.cloudflare.com/__down?bytes=' + testSize + '&cacheBuster=' + Date.now();
            var fetchStart = performance.now();

            var response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) throw new Error('Download failed');

            var reader = response.body.getReader();
            var receivedBytes = 0;

            while (true) {
                var result = await reader.read();
                if (result.done) break;

                receivedBytes += result.value.length;
                var elapsed = (performance.now() - fetchStart) / 1000;

                if (elapsed > 0) {
                    currentSpeed = (receivedBytes * 8) / (elapsed * 1e6);
                    setGaugeValue(currentSpeed);
                    document.getElementById('gaugeValue').textContent = currentSpeed.toFixed(1);
                    document.getElementById('downloadResult').textContent = currentSpeed.toFixed(2);
                    addGraphPoint(currentSpeed);
                }
            }

            var fetchEnd = performance.now();
            var duration = (fetchEnd - fetchStart) / 1000;

            if (duration > 0) {
                var speed = (receivedBytes * 8) / (duration * 1e6);
                speedSamples.push(speed);
                totalBytes += receivedBytes;
                totalTime += duration;
            }

            updateProgress(performance.now() - testStartTime, totalTestDuration);

            if (currentSpeed > 100 && testSize < 25e6) {
                continue;
            }

        } catch (e) {
            console.warn('Download test chunk failed:', e);
            try {
                var altUrl = 'https://speed.cloudflare.com/__down?bytes=' + Math.min(testSize, 1e6) + '&cacheBuster=' + Date.now() + '-alt';
                var fetchStart2 = performance.now();
                var response2 = await fetch(altUrl, { cache: 'no-store' });
                var blob = await response2.blob();
                var fetchEnd2 = performance.now();
                var duration2 = (fetchEnd2 - fetchStart2) / 1000;
                if (duration2 > 0) {
                    var speed2 = (blob.size * 8) / (duration2 * 1e6);
                    speedSamples.push(speed2);
                    totalBytes += blob.size;
                    totalTime += duration2;
                    currentSpeed = speed2;
                    setGaugeValue(currentSpeed);
                    document.getElementById('gaugeValue').textContent = currentSpeed.toFixed(1);
                    addGraphPoint(currentSpeed);
                }
            } catch (e2) {
                console.warn('Alt download also failed:', e2);
            }
        }
    }

    if (downloadIcon) downloadIcon.classList.remove('glow');

    if (speedSamples.length > 0) {
        if (speedSamples.length > 2) {
            speedSamples.sort(function(a, b) { return a - b; });
            speedSamples.shift();
        }
        var avgSpeed = speedSamples.reduce(function(a, b) { return a + b; }, 0) / speedSamples.length;
        return avgSpeed;
    }

    if (totalTime > 0) {
        return (totalBytes * 8) / (totalTime * 1e6);
    }

    return 0;
}

// --- Real Upload Speed Test (Extended to ~12s) ---
async function realUploadTest() {
    document.getElementById('gaugeLabel').textContent = 'Upload';
    document.getElementById('gaugeUnit').textContent = 'Mbps';
    setPhase('upload');
    graphData = [];
    document.getElementById('graphLabel').textContent = 'Upload speed over time';

    var uploadIcon = document.querySelector('.upload-icon');
    if (uploadIcon) uploadIcon.classList.add('glow');

    var testSizes = APP_CONFIG.speedTest.uploadSizes;

    var speedSamples = [];
    var testDuration = APP_CONFIG.speedTest.testDurationMs.upload;
    var startTime = performance.now();

    for (var t = 0; t < testSizes.length; t++) {
        var size = testSizes[t];
        if (performance.now() - startTime > testDuration) break;

        try {
            var data = new ArrayBuffer(size);
            var view = new Uint8Array(data);
            for (var i = 0; i < Math.min(view.length, 1024); i++) {
                view[i] = Math.floor(Math.random() * 256);
            }

            var blob = new Blob([data]);
            var url = 'https://speed.cloudflare.com/__up?cacheBuster=' + Date.now();

            var fetchStart = performance.now();
            var response = await fetch(url, {
                method: 'POST',
                body: blob,
                cache: 'no-store',
            });

            await response.text();
            var fetchEnd = performance.now();
            var duration = (fetchEnd - fetchStart) / 1000;

            if (duration > 0) {
                var speed = (size * 8) / (duration * 1e6);
                speedSamples.push(speed);

                setGaugeValue(speed);
                document.getElementById('gaugeValue').textContent = speed.toFixed(1);
                document.getElementById('uploadResult').textContent = speed.toFixed(2);
                addGraphPoint(speed);
            }

            updateProgress(performance.now() - testStartTime, totalTestDuration);
        } catch (e) {
            console.warn('Upload test chunk failed:', e);
            try {
                var smallSize = Math.min(size, 5e5);
                var data2 = new ArrayBuffer(smallSize);
                var blob2 = new Blob([data2]);
                var url2 = 'https://speed.cloudflare.com/__up?cacheBuster=' + Date.now() + '-retry';

                var fetchStart2 = performance.now();
                await fetch(url2, { method: 'POST', body: blob2, cache: 'no-store' });
                var fetchEnd2 = performance.now();
                var duration2 = (fetchEnd2 - fetchStart2) / 1000;

                if (duration2 > 0) {
                    var speed2 = (smallSize * 8) / (duration2 * 1e6);
                    speedSamples.push(speed2);
                    setGaugeValue(speed2);
                    document.getElementById('gaugeValue').textContent = speed2.toFixed(1);
                    addGraphPoint(speed2);
                }
            } catch (e2) {
                console.warn('Alt upload also failed:', e2);
            }
        }
    }

    if (uploadIcon) uploadIcon.classList.remove('glow');

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
    var startBtn = document.getElementById('startBtn');
    startBtn.classList.add('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'TESTING...';

    document.getElementById('downloadResult').textContent = '--';
    document.getElementById('uploadResult').textContent = '--';
    document.getElementById('pingResult').textContent = '--';
    document.getElementById('jitterResult').textContent = '--';

    // Remove highlight from all result values
    document.querySelectorAll('.result-value').forEach(function(el) {
        el.classList.remove('highlight');
    });

    resetPhases();
    showProgressBar();

    try {
        // Phase 1: Ping Test (~4-5 seconds)
        var pingResult = await realPingTest();
        document.getElementById('pingResult').textContent = pingResult.ping.toFixed(1);
        document.getElementById('jitterResult').textContent = pingResult.jitter.toFixed(1);
        document.getElementById('pingResult').classList.add('highlight');
        document.getElementById('jitterResult').classList.add('highlight');

        await sleep(APP_CONFIG.speedTest.interPhaseDelayMs);

        // Phase 2: Download Test (~12 seconds)
        var download = await realDownloadTest();
        document.getElementById('downloadResult').textContent = download.toFixed(2);
        document.getElementById('downloadResult').classList.add('highlight');

        await sleep(APP_CONFIG.speedTest.interPhaseDelayMs);

        // Phase 3: Upload Test (~12 seconds)
        var upload = await realUploadTest();
        document.getElementById('uploadResult').textContent = upload.toFixed(2);
        document.getElementById('uploadResult').classList.add('highlight');

        // Done
        completeAllPhases();
        hideGraph();
        document.getElementById('gaugeLabel').textContent = 'Complete';
        document.getElementById('gaugeUnit').textContent = 'Mbps';
        setGaugeValue(download);
        document.getElementById('gaugeValue').textContent = download.toFixed(1);

        // Update progress to 100%
        updateProgress(totalTestDuration, totalTestDuration);

        // Save to history
        saveTestResult({ download: download, upload: upload, ping: pingResult.ping, jitter: pingResult.jitter, timestamp: Date.now() });
        renderHistory();

    } catch (err) {
        document.getElementById('gaugeLabel').textContent = 'Error';
        console.error('Speed test error:', err);
        resetPhases();
        hideGraph();
    }

    isTesting = false;
    startBtn.classList.remove('testing');
    startBtn.querySelector('.start-btn-text').textContent = 'START TEST';

    // Hide progress bar after a delay
    setTimeout(function() {
        hideProgressBar();
    }, APP_CONFIG.speedTest.postTestHideProgressDelayMs);
}

// ===== IP INFO & WEATHER =====
var weatherLoadedWithCoords = false;

function fetchWithTimeout(url, options, timeoutMs) {
    if (!options) options = {};
    if (!timeoutMs) timeoutMs = APP_CONFIG.network.timeoutMs.default;
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
        .finally(function() { clearTimeout(timeoutId); });
}

function startWeatherFallback() {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var defaults = getDefaultCoordsFromTimezone(tz);
    fetchWeather(defaults.lat, defaults.lon, false);
}

async function fetchIPInfo() {
    var ipData = null;

    // Strategy 1: Cloudflare trace
    if (!ipData) {
        try {
            var response = await fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', {}, APP_CONFIG.network.timeoutMs.default);
            if (response.ok) {
                var text = await response.text();
                var cfData = {};
                text.split('\n').forEach(function(line) {
                    var idx = line.indexOf('=');
                    if (idx > 0) {
                        cfData[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
                    }
                });
                if (cfData.ip) {
                    ipData = {
                        ip: cfData.ip, isp: null, city: null, country: cfData.loc || null,
                        lat: null, lon: null, timezone: null, partial: true
                    };
                }
            }
        } catch (e) {
            console.warn('Cloudflare trace failed:', e.message);
        }
    }

    // Strategy 2: ipapi.co
    if (!ipData || ipData.partial) {
        try {
            var response2 = await fetchWithTimeout('https://ipapi.co/json/', {}, APP_CONFIG.network.timeoutMs.ipapi);
            if (response2.ok) {
                var data2 = await response2.json();
                if (data2 && data2.ip && !data2.error && !data2.reason) {
                    ipData = {
                        ip: data2.ip, isp: data2.org || 'Unknown', city: data2.city || null,
                        country: data2.country_name || null, lat: data2.latitude, lon: data2.longitude,
                        timezone: data2.timezone, partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('ipapi.co failed:', e.message);
        }
    }

    // Strategy 3: ipwho.is
    if (!ipData || ipData.partial) {
        try {
            var response3 = await fetchWithTimeout('https://ipwho.is/', {}, APP_CONFIG.network.timeoutMs.ipwho);
            if (response3.ok) {
                var data3 = await response3.json();
                if (data3 && data3.success !== false && data3.ip) {
                    ipData = {
                        ip: data3.ip, isp: data3.connection ? data3.connection.isp : 'Unknown',
                        city: data3.city || null, country: data3.country || null,
                        lat: data3.latitude, lon: data3.longitude,
                        timezone: data3.timezone ? data3.timezone.id : null, partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('ipwho.is failed:', e.message);
        }
    }

    // Strategy 4: ipify.org
    if (!ipData) {
        try {
            var response4 = await fetchWithTimeout('https://api.ipify.org?format=json', {}, APP_CONFIG.network.timeoutMs.default);
            if (response4.ok) {
                var data4 = await response4.json();
                if (data4 && data4.ip) {
                    ipData = {
                        ip: data4.ip, isp: null, city: null, country: null,
                        lat: null, lon: null, timezone: null, partial: true
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
            var response5 = await fetchWithTimeout(
                'https://ip-api.com/json/?fields=status,message,query,isp,city,country,lat,lon,timezone',
                {}, APP_CONFIG.network.timeoutMs.default
            );
            if (response5.ok) {
                var data5 = await response5.json();
                if (data5.status === 'success') {
                    ipData = {
                        ip: data5.query, isp: data5.isp || 'Unknown', city: data5.city || null,
                        country: data5.country || null, lat: data5.lat, lon: data5.lon,
                        timezone: data5.timezone, partial: false
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
            var response6 = await fetchWithTimeout('https://freeipapi.com/api/json', {}, APP_CONFIG.network.timeoutMs.default);
            if (response6.ok) {
                var data6 = await response6.json();
                if (data6 && data6.ipAddress) {
                    ipData = {
                        ip: data6.ipAddress,
                        isp: data6.isp || (ipData ? ipData.isp : null) || 'Unknown',
                        city: data6.cityName || (ipData ? ipData.city : null) || null,
                        country: data6.countryName || (ipData ? ipData.country : null) || null,
                        lat: data6.latitude || (ipData ? ipData.lat : null),
                        lon: data6.longitude || (ipData ? ipData.lon : null),
                        timezone: data6.timeZone || (ipData ? ipData.timezone : null),
                        partial: false
                    };
                }
            }
        } catch (e) {
            console.warn('freeipapi.com failed:', e.message);
        }
    }

    // Update UI
    if (ipData) {
        document.getElementById('ipAddress').textContent = ipData.ip;
        document.getElementById('ipISP').textContent = 'ISP: ' + (ipData.isp || 'Unknown');

        var city = ipData.city || '--';
        var country = ipData.country || '--';
        if (city !== '--' || country !== '--') {
            document.getElementById('ipLocation').textContent = 'Location: ' + city + ', ' + country;
        } else {
            document.getElementById('ipLocation').textContent = 'Location: --';
        }

        document.getElementById('serverName').textContent = 'Cloudflare CDN (' + (city !== '--' ? city : 'Auto') + ')';

        if (ipData.lat && ipData.lon && !weatherLoadedWithCoords) {
            fetchWeather(ipData.lat, ipData.lon, true);
        }
    } else {
        document.getElementById('ipAddress').textContent = 'Could not detect';
        document.getElementById('ipISP').textContent = 'ISP: --';
        document.getElementById('ipLocation').textContent = 'Location: --';
        tryBrowserGeolocation();
    }
}

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
            { timeout: APP_CONFIG.network.timeoutMs.default }
        );
    }
}

function getDefaultCoordsFromTimezone(tz) {
    var tzCoords = {
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

    var keys = Object.keys(tzCoords);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (tz && tz.includes(key.split('/')[1])) {
            return tzCoords[key];
        }
    }

    return { lat: -6.2, lon: 106.8 };
}

async function fetchWeather(lat, lon, isAccurateCoords) {
    if (weatherLoadedWithCoords && !isAccurateCoords) return;

    try {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';
        var response = await fetchWithTimeout(url, {}, APP_CONFIG.network.timeoutMs.weather);

        if (!response.ok) throw new Error('Weather API returned ' + response.status);

        var data = await response.json();

        if (data && data.current) {
            var temp = data.current.temperature_2m;
            var humidity = data.current.relative_humidity_2m;
            var windSpeed = data.current.wind_speed_10m;
            var weatherCode = data.current.weather_code;

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
        if (!weatherLoadedWithCoords) {
            document.getElementById('weatherDesc').textContent = 'Weather unavailable';
            document.getElementById('weatherEmoji').textContent = '\u2753';
            document.getElementById('weatherTemp').textContent = '--\u00B0C';
        }
    }
}

function getWeatherDescription(code) {
    var descriptions = {
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

function safeParseJSON(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (err) {
        return fallback;
    }
}

function initHistory() {
    var historyBtn = document.getElementById('historyBtn');
    var historyPanel = document.getElementById('historyPanel');
    var historyClose = document.getElementById('historyClose');
    var historyClear = document.getElementById('historyClear');

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
    var history = safeParseJSON(localStorage.getItem(HISTORY_KEY) || '[]', []);
    history.unshift(result);
    if (history.length > APP_CONFIG.speedTest.maxHistoryItems) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
    var historyList = document.getElementById('historyList');
    var historyEmpty = document.getElementById('historyEmpty');
    var history = safeParseJSON(localStorage.getItem(HISTORY_KEY) || '[]', []);

    var existingItems = historyList.querySelectorAll('.history-item');
    existingItems.forEach(function(item) { item.remove(); });

    if (history.length === 0) {
        historyEmpty.style.display = 'flex';
        return;
    }

    historyEmpty.style.display = 'none';

    history.forEach(function(result) {
        var item = document.createElement('div');
        item.className = 'history-item';

        var date = new Date(result.timestamp);
        var timeStr = date.toLocaleString('en-US', {
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
