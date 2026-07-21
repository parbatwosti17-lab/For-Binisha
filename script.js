// 1. Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Mouse Orbit Controls (हातले वा माउसले चलाउनको लागि)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Main Heart Group
const heartGroup = new THREE.Group();
scene.add(heartGroup);

// -------------------------------------------------------------
// A. Heart Particle Generation
// -------------------------------------------------------------
const path = document.querySelector("#heart-path");
const length = path.getTotalLength();
const heartVertices = [];

for (let i = 0; i < length; i += 0.015) {
  const point = path.getPointAtLength(i);
  const vector = new THREE.Vector3(
    (point.x - 12) * 2.8,
    (-point.y + 12) * 2.8,
    0
  );
  
  // Depth र scattered bubble effect
  vector.x += (Math.random() - 0.5) * 3;
  vector.y += (Math.random() - 0.5) * 3;
  vector.z += (Math.random() - 0.5) * 10;

  heartVertices.push(vector);
}

const heartGeometry = new THREE.BufferGeometry().setFromPoints(heartVertices);
const heartMaterial = new THREE.PointsMaterial({
  color: 0xff2a5f,
  size: 0.6,
  transparent: true,
  opacity: 0.85
});

const heartParticles = new THREE.Points(heartGeometry, heartMaterial);
heartGroup.add(heartParticles);

// -------------------------------------------------------------
// B. Always-Facing Text ("BINISHA") using 3D Canvas Sprite
// -------------------------------------------------------------
function createTextSprite(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = 1024;
  canvas.height = 256;

  // Clear Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text Styling & Glow Effect
  ctx.font = "Bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Glow
  ctx.shadowColor = "#ff2a5f";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    depthTest: false // Ensures text stays visible inside the particle cloud
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(35, 8.75, 1); // Aspect ratio maintained
  return sprite;
}

const textSprite = createTextSprite("BINISHA");
scene.add(textSprite); // Added to scene directly so it won't flip with heart rotation

// -------------------------------------------------------------
// C. GSAP Particle Animation (Fly in into Heart Shape)
// -------------------------------------------------------------
const tl = gsap.timeline();

heartVertices.forEach((v, i) => {
  const targetX = v.x, targetY = v.y, targetZ = v.z;
  
  // Random starting positions
  v.x = (Math.random() - 0.5) * 300;
  v.y = (Math.random() - 0.5) * 300;
  v.z = (Math.random() - 0.5) * 300;

  tl.to(
    v, 
    { 
      x: targetX, 
      y: targetY, 
      z: targetZ, 
      duration: 3, 
      ease: "power3.out" 
    }, 
    i * 0.0006
  );
});

// Text appearance animation
textSprite.scale.set(0, 0, 0);
tl.to(textSprite.scale, { x: 35, y: 8.75, z: 1, duration: 2, ease: "back.out(1.7)" }, "-=1");

// -------------------------------------------------------------
// D. Animation Loop
// -------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  // Update geometry position each frame
  heartGeometry.setFromPoints(heartVertices);

  // Auto rotation for the Heart Shape
  heartGroup.rotation.y += 0.005;

  // Keep Text Sprite aligned at center
  textSprite.position.copy(heartGroup.position);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});