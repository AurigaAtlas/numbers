// Small imperative motion helpers built on the Web Animations API.

export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function centerOf(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function viewportCenter() {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function bump(element) {
  if (!element || prefersReducedMotion()) return;
  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.16) rotate(-3deg)" },
      { transform: "scale(0.96) rotate(1deg)" },
      { transform: "scale(1)" }
    ],
    { duration: 380, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
  );
}

// Coins burst out of `from`, hang in the air for a beat, then swoop into `to`.
export function flyCoins({ from, to, count = 5, onEach, onDone }) {
  if (!from || !to) return;
  const total = Math.max(1, Math.min(count, 10));
  if (prefersReducedMotion()) {
    onEach?.(0);
    onDone?.();
    return;
  }

  let finished = 0;
  for (let index = 0; index < total; index += 1) {
    const coin = document.createElement("span");
    coin.className = "flying-coin";
    coin.setAttribute("aria-hidden", "true");
    document.body.appendChild(coin);

    const spreadX = from.x + (Math.random() - 0.5) * 160;
    const spreadY = from.y - 30 - Math.random() * 70;
    const animation = coin.animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(0.2) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${spreadX}px, ${spreadY}px) translate(-50%, -50%) scale(1.15) rotate(160deg)`, opacity: 1, offset: 0.32 },
        { transform: `translate(${spreadX}px, ${spreadY + 6}px) translate(-50%, -50%) scale(1) rotate(200deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.5) rotate(360deg)`, opacity: 0.9 }
      ],
      {
        duration: 900 + index * 30,
        delay: index * 65,
        easing: "cubic-bezier(0.5, 0, 0.2, 1)",
        fill: "both"
      }
    );
    animation.onfinish = () => {
      coin.remove();
      onEach?.(index);
      finished += 1;
      if (finished === total) onDone?.();
    };
  }
}
