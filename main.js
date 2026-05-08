/* ═══════════════════════════════════════════════════════════════
   TANMAY GEMINI — PORTFOLIO JS v3
   Additions: particle canvas, magnetic buttons, smooth scroll
   progress, staggered filter animation, tilt cards
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. TYPED.JS ──────────────────────────────────────────────
  if (window.Typed && document.getElementById('typed-text')) {
    new Typed('#typed-text', {
      strings: [
        'Building Agentic AI Systems.',
        'Full-Stack Product Engineer.',
        'LangChain & AutoGen Dev.',
        'Claude AI & MCP Architect.',
        'PKI & Cryptography Engineer.',
        'Open to Freelance & Full-Time.',
      ],
      typeSpeed: 40, backSpeed: 20, backDelay: 2000,
      startDelay: 800, loop: true, showCursor: true, cursorChar: '|',
    });
  }

  // ── 2. CURSOR GLOW ───────────────────────────────────────────
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    // Use transform instead of top/left — no layout reflow, GPU-composited
    // Remove mix-blend-mode:screen (invisible on dark #09090b background)
    // Boost opacity & color so glow is actually visible on dark bg
    glow.style.cssText = `
      position: fixed;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      top: 0;
      left: 0;
      background: radial-gradient(circle, rgba(155,127,244,0.18) 0%, rgba(124,58,237,0.10) 30%, transparent 70%);
      will-change: transform;
      transition: opacity 0.4s ease;
    `;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx, gy = my;
    let hasMoved = false;

    // Start visible — don't wait for pointerenter
    glow.style.opacity = '1';

    window.addEventListener('pointermove', e => {
      mx = e.clientX;
      my = e.clientY;
      if (!hasMoved) {
        // Snap to cursor on first move to avoid flying in from corner
        gx = mx;
        gy = my;
        hasMoved = true;
      }
    });

    window.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
    window.addEventListener('pointerenter', () => { glow.style.opacity = '1'; });

    (function tick() {
      // Lerp factor 0.12 — snappier, visually responsive
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      // translate so center of 450px div is on cursor: offset by -225px
      glow.style.transform = `translate(${Math.round(gx - 225)}px, ${Math.round(gy - 225)}px)`;
      requestAnimationFrame(tick);
    })();
  }

  // ── 3. PARTICLE CANVAS ───────────────────────────────────────
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['rgba(155,127,244,0.5)', 'rgba(124,58,237,0.4)', 'rgba(196,176,255,0.35)', 'rgba(34,212,114,0.25)'];

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : -10;
        this.r = Math.random() * 1.4 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = Math.random() * 0.35 + 0.1;
        this.alpha = Math.random() * 0.6 + 0.1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life = 0;
        this.maxLife = Math.random() * 400 + 200;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Subtle parallax effect tracking the mouse
        const dx = mouseX - W / 2;
        const dy = mouseY - H / 2;
        this.x -= dx * 0.0005 * this.r;
        this.y -= dy * 0.0005 * this.r;

        this.life++;
        if (this.life > this.maxLife || this.y > H + 10 || this.x < -10 || this.x > W + 10) this.reset();
      }
      draw() {
        const fade = Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 60, 1);
        ctx.globalAlpha = this.alpha * fade;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const numParticles = window.innerWidth < 768 ? 60 : 200;
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());

    let mouseX = W / 2, mouseY = H / 2;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    const animParticles = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      
      const maxDist = W < 768 ? 45 : 75;

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.globalAlpha = (1 - dist / maxDist) * 0.04;
            ctx.strokeStyle = 'rgba(155,127,244,0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => { p.update(); p.draw(); });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animParticles);
    };
    animParticles();
  }

  // ── 4. ACTIVE NAV ON SCROLL ──────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navItems.forEach(n => n.classList.toggle('active', n.dataset.section === e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => navObs.observe(s));

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const el = document.getElementById(item.dataset.section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('show');
    });
  });

  // ── 5. SCROLL REVEAL ─────────────────────────────────────────
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  // ── 6. MOBILE NAV ────────────────────────────────────────────
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  });

  // ── 7. PROJECT FILTER (with stagger animation) ───────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      let visIdx = 0;
      document.querySelectorAll('.project-card').forEach(card => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.includes(filter);
        if (!show) {
          card.classList.add('hidden');
        } else {
          card.classList.remove('hidden');
          card.style.transitionDelay = (visIdx * 0.045) + 's';
          // Trigger re-animation
          card.style.opacity = '0';
          card.style.transform = 'translateX(0) translateY(10px)';
          setTimeout(() => {
            card.style.opacity = '';
            card.style.transform = '';
          }, 20 + visIdx * 45);
          visIdx++;
        }
      });
    });
  });

  // ── 8. HERO ENTRANCE ─────────────────────────────────────────
  document.querySelectorAll('.hero-animate').forEach((el, i) => {
    el.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease';
    el.style.transitionDelay = (0.15 + i * 0.12) + 's';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });

  // ── 9. PROJECT CARD TILT ─────────────────────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = ((y - cy) / cy) * 1.5;
      const tiltY = -((x - cx) / cx) * 1.5;
      card.style.transform = `translateX(6px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── 10. MAGNETIC BUTTONS ─────────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── 11. COPY EMAIL ───────────────────────────────────────────
  document.getElementById('copy-email')?.addEventListener('click', e => {
    e.preventDefault();
    navigator.clipboard?.writeText('tanmay8506@gmail.com').then(() => {
      const span = document.querySelector('#copy-email span');
      const orig = span.textContent;
      span.textContent = '✓ Copied!';
      document.getElementById('copy-email').style.cssText = 'border-color:rgba(34,212,114,0.4);color:#22d472';
      setTimeout(() => {
        span.textContent = orig;
        document.getElementById('copy-email').style.cssText = '';
      }, 2200);
    });
  });

  // ── 12. YEAR ─────────────────────────────────────────────────
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── 13. CONTACT FORM (Formspree) ─────────────────────────────
  const FORMSPREE_ID = 'REPLACE_ME';
  if (FORMSPREE_ID && FORMSPREE_ID !== 'REPLACE_ME') {
    const form = document.getElementById('contact-form');
    if (form) {
      document.querySelector('.contact-form')?.classList.add('show');
      form.action = `https://formspree.io/f/${FORMSPREE_ID}`;
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit .btn');
        const orig = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = true;
        try {
          const res = await fetch(form.action, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form),
          });
          if (res.ok) {
            btn.textContent = '✓ Sent!';
            btn.style.background = 'rgba(34,212,114,0.15)';
            form.reset();
          } else {
            btn.textContent = 'Error — try email';
            btn.style.background = 'rgba(240,80,96,0.15)';
          }
        } catch {
          btn.textContent = 'Network error';
        }
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3500);
      });
    }
  }

  // ── 14. SCROLL PROGRESS LINE ─────────────────────────────────
  const progressLine = document.createElement('div');
  progressLine.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #7c3aed, #9b7ff4, #c4b0ff);
    z-index: 9999; transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(155, 127, 244, 0.6);
  `;
  document.body.appendChild(progressLine);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    progressLine.style.width = pct + '%';
  });

  // ── 15. SKILL PILL RIPPLE ────────────────────────────────────
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect = pill.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute; border-radius: 50%;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
        background: rgba(155,127,244,0.25);
        transform: scale(0); animation: ripple-out 0.5s ease-out forwards;
        pointer-events: none;
      `;
      pill.style.position = 'relative';
      pill.style.overflow = 'hidden';
      pill.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Inject ripple keyframe
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `@keyframes ripple-out { to { transform: scale(2.5); opacity: 0; } }`;
  document.head.appendChild(rippleStyle);

  // ── 16. STATS COUNTER ANIMATION ──────────────────────────────
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.textContent);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      if (isNaN(target)) return;
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.astat-num').forEach(el => statObs.observe(el));

});
