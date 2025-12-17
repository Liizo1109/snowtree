const arr = [];

const c = document.querySelector("canvas");
const ctx = c.getContext("2d");

const cw = (c.width = 3000);
const ch = (c.height = 3000);

const c2 = document.createElement("canvas");
const ctx2 = c2.getContext("2d", { willReadFrequently: true });

c2.width = cw;
c2.height = ch;
ctx2.clearRect(0, 0, cw, ch);

for (let i = 0; i < 1300; i++) makeFlake(i, true);

function makeFlake(i, ff) {
  const flake = {
    x: -400 + (cw + 800) * Math.random(),
    y: -15,
    x2: -500,
    s: gsap.utils.random(1.8, 7)
  };

  flake.t = gsap.timeline({ repeat: -1 })
    .to(flake, {
      ease: "none",
      y: ch,
      x: "+=" + gsap.utils.random(-400, 400),
      x2: 500,
      duration: gsap.utils.random(6, 14)
    })
    .seek(ff ? Math.random() * 10 : 0);

  arr.push(flake);
}


ctx.fillStyle = "#fff";
gsap.ticker.add(render);

function render() {
  ctx.clearRect(0, 0, cw, ch);

  arr.forEach((p) => {
    if (p.t && p.t.isActive()) {
      const d = ctx2.getImageData(p.x + p.x2, p.y, 1, 1);

      if (d.data[3] > 150 && Math.random() > 0.5) {
        p.t.pause();
        if (arr.length < 9000) makeFlake(arr.length - 1, false);
      }
    }

    ctx.beginPath();
    ctx.arc(
      p.x + p.x2,
      p.y,
      p.s * gsap.utils.interpolate(1, 0.2, p.y / ch),
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}
