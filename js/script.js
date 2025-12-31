// Text synchronization with audio
const textDisplay = document.getElementById('textDisplay');
const syncedText = document.getElementById('syncedText');
const audioPlayer = document.getElementById('audioPlayer');
const videoSection = document.getElementById('videoSection');
const mainVideo = document.getElementById('mainVideo');
const fireworksBtn = document.getElementById('fireworksBtn');
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// Text to display word by word, with timing
const fullText = "And with that, the 2025 season comes to an end. GOOD NIGHT.";
const words = fullText.split(' ');
// Manually set the time (in seconds) for each word to appear (adjust for perfect sync)
const wordTimes = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
let currentWord = 0;

// Start Celebration button logic
const startBtn = document.getElementById('startBtn');
textDisplay.classList.add('active');
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    syncedText.textContent = '';
    currentWord = 0;
    audioPlayer.play();
});

// Sync text with audio
// Sync each word to audio time
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;
    let lastWordIndex = words.length - 1;
    let displayText = '';
    let fadeWord = '';
    for (let i = 0; i < words.length; i++) {
        if (currentTime >= wordTimes[i]) {
            // Fade in the last word and make it pink
            if (i === lastWordIndex) {
                const opacity = Math.min(1, (currentTime-wordTimes[i])/0.3);
                fadeWord = `<span style=\"color:pink;transition:opacity 0.3s;opacity:${opacity};\">${words[i]}</span>`;
            } else {
                fadeWord = words[i];
            }
            displayText += (i === 0 ? '' : ' ') + fadeWord;
        }
    }
    syncedText.innerHTML = displayText;
    // Only cut audio and switch after 'GOOD NIGHT.' is fully shown and a short delay
    if (
        currentTime >= wordTimes[lastWordIndex] &&
        syncedText.textContent.trim().endsWith('GOOD NIGHT.') &&
        !audioPlayer._cutScheduled
    ) {
        audioPlayer._cutScheduled = true;
        setTimeout(() => {
            audioPlayer.pause();
            textDisplay.classList.remove('active');
            videoSection.classList.add('active');
            mainVideo.currentTime = 13;
            mainVideo.play();
        }, 700); // 0.7s delay for smooth finish
    }
});

// When audio ends, show video section
audioPlayer.addEventListener('ended', () => {
    textDisplay.classList.remove('active');
    videoSection.classList.add('active');
});

// Fireworks functionality
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class FireworkRocket {
    constructor(x, y, targetY, color) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.color = color;
        this.radius = 3;
        this.speed = 7;
        this.exploded = false;
    }
    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.exploded = true;
                createFireworkBurst(this.x, this.y, this.color);
                playRealFireworkSound();
            }
        }
    }
    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
            // Draw rocket trail
            ctx.save();
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 10);
            ctx.lineTo(this.x, this.y + 30);
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.restore();
        }
    }
}

class FireworkParticle {
    constructor(x, y, color, angle, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = angle;
        this.speed = speed;
        this.radius = 2 + Math.random() * 2;
        this.alpha = 1;
        this.life = 0;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.speed *= 0.98;
        this.alpha -= 0.012;
        this.life++;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }
}

let fireworkParticles = [];
let fireworkRockets = [];
const fireworkColors = ['#fff', '#39ff14', '#ff2a6d', '#00e5ff', '#fff01f'];

function createFireworkBurst(x, y, color) {
    const count = 80;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 3 + Math.random() * 2.5;
        fireworkParticles.push(new FireworkParticle(x, y, color, angle, speed));
    }
}

function animateFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Animate rockets
    fireworkRockets.forEach((r, idx) => {
        r.update();
        r.draw(ctx);
        if (r.exploded) fireworkRockets.splice(idx, 1);
    });
    // Animate burst particles
    fireworkParticles.forEach((p, idx) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) fireworkParticles.splice(idx, 1);
    });
    requestAnimationFrame(animateFireworks);
}

// Play real fireworks sound
function playRealFireworkSound() {
    let audio = document.getElementById('fireworkAudio');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'fireworkAudio';
        audio.src = 'assets/firework.mp3'; // Place a real firework sound file here
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }
    audio.currentTime = 0;
    audio.play();
}

fireworksBtn.addEventListener('click', () => {
    canvas.classList.add('active');
    videoSection.style.display = 'none';
    mainVideo.muted = true;
    // Launch multiple fireworks from bottom center in sequence
    const fireworkCount = 7;
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            const rocketColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
            fireworkRockets.push(new FireworkRocket(
                canvas.width / 2 + (Math.random() - 0.5) * 120,
                canvas.height,
                canvas.height / 2 + (Math.random() - 0.5) * 80,
                rocketColor
            ));
            playSynthFireworkSound();
        }, i * 700);
    }
    // Hide canvas after fireworks finish, do not restore video
    setTimeout(() => {
        canvas.classList.remove('active');
        fireworkParticles = [];
        fireworkRockets = [];
        if (!mainVideo.paused) mainVideo.pause();
        // Show popup message after fireworks
        setTimeout(() => {
            showGrahamPopup();
        }, 400); // slight delay for effect
    }, 7000);
// Show a popup message 'PAHINGI GRAHAM'
function showGrahamPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 2000;

    // Create message box
    const msg = document.createElement('div');
    msg.textContent = 'PAHINGI GRAHAM';
    msg.style.background = '#fff';
    msg.style.color = '#d72660';
    msg.style.fontSize = '2.5rem';
    msg.style.fontWeight = 'bold';
    msg.style.padding = '2rem 3rem';
    msg.style.borderRadius = '2rem';
    msg.style.boxShadow = '0 8px 40px rgba(0,0,0,0.3)';
    msg.style.textAlign = 'center';
    msg.style.letterSpacing = '0.1em';
    msg.style.animation = 'popupFadeIn 0.7s';

    // Add close on click
    overlay.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.appendChild(msg);
    document.body.appendChild(overlay);
}

// Add popup fade-in animation
const popupStyle = document.createElement('style');
popupStyle.textContent = `@keyframes popupFadeIn { from { opacity: 0; transform: scale(0.8);} to { opacity: 1; transform: scale(1);} }`;
document.head.appendChild(popupStyle);
});

// More realistic synthesized firework sound using Web Audio API
function playSynthFireworkSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Whistle (launch)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    // Deep rumble and crackle (explosion)
    setTimeout(() => {
        const bufferSize = ctx.sampleRate * 0.45;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Add crackle and rumble
            let crackle = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
            let rumble = Math.sin(i / 30) * Math.exp(-i / (ctx.sampleRate * 0.12));
            data[i] = crackle * 0.7 + rumble * 0.3;
        }
        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.7;
        noise.buffer = buffer;
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(0.8, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.45);
    }, 500);
}

animateFireworks();