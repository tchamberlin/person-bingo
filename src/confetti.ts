import confetti from 'canvas-confetti';

export let confettiActive = false;
export let density = 100;
const duration = 60 * 1000;
const defaults = {
  startVelocity: 15,
  spread: 360,
  ticks: 250,
  zIndex: 2000,
  particleCount: density,
  gravity: randomInRange(0.3, 0.6),
};

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function confettiIsActive() {
  console.log('confettiIsActive', confettiActive);
  return confettiActive;
}

export function toggleConfetti(options) {
  if (!confettiActive) {
    startConfetti(options || {});
    console.log('toggle confetti on', confettiActive);
    return true;
  } else {
    stopConfetti();
    console.log('toggle confetti off', confettiActive);
    return false;
  }
}

export function stopConfetti() {
  confettiActive = false;
}

export const startConfetti = (options) => {
  const animationEnd = Date.now() + duration;
  options = options || {};
  console.log(`starting confetti; end at ${animationEnd}; given options:`, options);
  if (!confettiActive) {
    confettiActive = true;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0 || !confettiActive) {
        return clearInterval(interval);
      }

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        ...options,
        origin: { x: randomInRange(0.2, 0.5), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        ...options,
        origin: { x: randomInRange(0.5, 0.8), y: Math.random() - 0.2 },
      });
    }, 2000);
  } else {
    console.log('confetti already active');
  }
};
