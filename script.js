const steps = [...document.querySelectorAll('.story-step')];
const pieces = [...document.querySelectorAll('.watch-piece')];

function activateStep(step) {
  steps.forEach((node) => node.classList.toggle('is-active', node === step));
  const target = step.dataset.target;

  pieces.forEach((piece) => {
    const isMatch = piece.dataset.piece === target;
    piece.classList.toggle('active', isMatch || piece.classList.contains('locked'));
    if (isMatch) {
      piece.classList.add('locked');
    }
  });
}

const io = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) activateStep(visible.target);
  },
  {
    threshold: [0.3, 0.45, 0.65],
    rootMargin: '-10% 0px -35% 0px'
  }
);

steps.forEach((step) => io.observe(step));

window.addEventListener('scroll', () => {
  const progress = Math.min(1, window.scrollY / (document.body.scrollHeight - innerHeight));
  pieces.forEach((piece, index) => {
    const depth = (index + 1) * 8;
    const driftX = Math.sin(progress * 12 + index) * depth;
    const driftY = Math.cos(progress * 8 + index * 0.7) * (depth * 0.5);
    piece.style.translate = `${driftX}px ${driftY}px`;
  });
}, { passive: true });

if (steps[0]) activateStep(steps[0]);
