(function () {
  gsap.set("svg", { visibility: "visible" });

  const mainSVG = document.querySelector(".mainSVG");
  const pContainer = document.querySelector(".pContainer");
  const sparkle = document.querySelector(".sparkle");
  const star = document.querySelector(".treeStar");
  const starOutline = document.querySelector(".treeStarOutline");

  const COLORS =
    "#E8F6F8 #ACE8F8 #F6FBFE #A2CBDC #FFD166 #F94144 #90DBF4 #CDB4DB".split(" ");
  const SHAPES = ["#star", "#circ", "#cross", "#heart"];

  const PARTICLE_COUNT = 220;
  const particles = [];
  let index = 0;
  let emitFromPath = true;

  const rand = gsap.utils.random;

  /* --------------------------------
   * Utils
   * -------------------------------- */

  function scaleRand() {
    return rand(0.6, 3);
  }

  function flicker(el) {
    gsap.killTweensOf(el, "opacity");
    gsap.fromTo(
      el,
      { opacity: 1 },
      {
        opacity: () => rand(0.3, 1),
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      }
    );
  }

  function drawSVG(path, duration, delay = 0) {
    const el = document.querySelector(path);
    if (!el) return;

    const len = el.getTotalLength();
    gsap.set(el, {
      strokeDasharray: len,
      strokeDashoffset: len,
      opacity: 1,
    });
    gsap.to(el, {
      strokeDashoffset: 0,
      duration,
      delay,
      ease: "linear",
    });
  }

  /* --------------------------------
   * RESET wave "~" path (FIX)
   * -------------------------------- */

  (function resetWave() {
    const wave = document.querySelector(".treeWaveMask");
    if (!wave) return;

    const len = wave.getTotalLength();
    gsap.set(wave, {
      strokeDasharray: len,
      strokeDashoffset: len,
      opacity: 1,
    });
  })();

  /* --------------------------------
   * Physics-like particle
   * -------------------------------- */

  function physicsBurst(el, power = 1) {
    let angle = rand(-Math.PI, Math.PI);
    let speed = rand(2, 5) * power;

    let vx = Math.cos(angle) * speed * 2;
    let vy = Math.sin(angle) * speed * 2;

    let gravity = rand(0.12, 0.3);
    let drag = 0.985;

    flicker(el);

    gsap.to(el, {
      duration: rand(2.5, 5.5),
      scale: 0,
      rotation: "+=" + rand(-360, 360),
      ease: "power1.out",
      onUpdate() {
        vx *= drag;
        vy = vy * drag + gravity;
        gsap.set(el, { x: "+=" + vx, y: "+=" + vy });
      },
      onComplete() {
        gsap.killTweensOf(el);
      },
    });
  }

  function emit(power = 1) {
    const el = particles[index];

    if (emitFromPath) {
      gsap.set(el, {
        x: gsap.getProperty(pContainer, "x"),
        y: gsap.getProperty(pContainer, "y"),
        scale: scaleRand(),
      });
    }

    physicsBurst(el, power);
    index = (index + 1) % particles.length;
  }

  /* --------------------------------
   * Build particles
   * -------------------------------- */

  (function () {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = document
        .querySelector(SHAPES[i % SHAPES.length])
        .cloneNode(true);

      s.setAttribute("fill", COLORS[i % COLORS.length]);
      s.setAttribute("class", "particle");

      mainSVG.appendChild(s);

      gsap.set(s, {
        x: -300,
        y: -300,
        scale: scaleRand(),
        transformOrigin: "50% 50%",
      });

      particles.push(s);
    }
  })();

  /* --------------------------------
   * MotionPath (FREE)
   * -------------------------------- */

  function followPath(pathSel, duration, onMove, onDone) {
    const path = document.querySelector(pathSel);
    const len = path.getTotalLength();

    gsap.to(
      { t: 0 },
      {
        t: 1,
        duration,
        ease: "none",
        onUpdate() {
          const p = path.getPointAtLength(this.targets()[0].t * len);
          onMove(p);
        },
        onComplete: onDone,
      }
    );
  }

  /* --------------------------------
   * Main flow
   * -------------------------------- */

  followPath(".treePath", 6, (p) => {
    gsap.set([pContainer, sparkle], { x: p.x, y: p.y });
    emit(1);
  });

  gsap.to({}, {
    duration: 1,
    onStart() {
      emitFromPath = false;
    },
    onUpdate() {
      emit(0.6);
    },
  });

  followPath(".treeBottomPath", 2, (p) => {
    emitFromPath = true;
    gsap.set([pContainer, sparkle], { x: p.x, y: p.y });
    emit(1.2);
  });

  /* --------------------------------
   * SVG draw (ORDER FIXED)
   * -------------------------------- */

  drawSVG(".treePathMask", 6);
  drawSVG(".treeWaveMask", 1.5, 5.2); // ← FIX: nét "~" vẽ dần
  drawSVG(".treePotMask", 2, 6);

  /* --------------------------------
   * ⭐ STAR — WOW + FIX
   * -------------------------------- */

  gsap.set([star, starOutline], {
    opacity: 1,
    scale: 1,
    transformOrigin: "50% 50%",
  });

  gsap.from(star, {
    duration: 3,
    scale: 0,
    rotation: -180,
    ease: "elastic.out(1, 0.45)",
    delay: 4,
  });

  gsap.to(star, {
    scale: 1.08,
    repeat: -1,
    yoyo: true,
    duration: 1.6,
    ease: "sine.inOut",
    delay: 7,
  });

  gsap.to(starOutline, {
    opacity: 1,
    repeat: -1,
    yoyo: true,
    duration: 2,
    ease: "sine.inOut",
    delay: 7,
  });

  /* --------------------------------
   * 🌟 WOW moment: STAR BURST
   * -------------------------------- */

  gsap.delayedCall(7, () => {
    for (let i = 0; i < 40; i++) {
      const el = particles[i];
      gsap.set(el, {
        x: gsap.getProperty(star, "x"),
        y: gsap.getProperty(star, "y"),
        scale: scaleRand(),
      });
      physicsBurst(el, 2.2);
    }
  });

  /* --------------------------------
   * Sparkle fade
   * -------------------------------- */

  gsap.to(".sparkle", {
    duration: 3,
    opacity: 0,
    ease: "steps(16)",
    delay: 6,
  });

  gsap.globalTimeline.timeScale(1.5);

  gsap.delayedCall(11, () => {
    gsap.to("#endMessage", { opacity: 1 });
  });
})();
