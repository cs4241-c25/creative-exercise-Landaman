import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;

function getFrustum() {
  return camera.position.z * Math.tan((camera.fov * (Math.PI / 180)) / 2);
}

/**
 * @typedef {Object} BoxAndInfo
 * @property {THREE.Mesh<THREE.BoxGeometry, THREE.Mesh, THREE.Object3DEventMap>} box
 * @property {number} yVelocity
 */

/** @returns {BoxAndInfo} */
function makeRandomBox() {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.random() * 2 + 1,
      Math.random() * 2 + 1,
      Math.random() * 2 + 1,
    ),
    new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }),
  );

  // Randomly position each box from the left edge to the right edge
  const xRight = camera.position.x + getFrustum();
  box.position.x = Math.random() * xRight * 2 - xRight;

  // Position the camera at the top of the screen
  box.position.y = camera.position.y + getFrustum();

  box.castShadow = true;
  box.receiveShadow = true;

  scene.add(box);

  return { box, yVelocity: Math.random() * ForceOfGravity };
}

/** @type {BoxAndInfo[]} */
let randomBoxes = [];
const MaxBoxes = 10;
const ForceOfGravity = 9.8;
const BounceElasticity = 0.5;
const MinBoxVelocity = 1;

let lastTime = new Date().getTime();
function animate() {
  if (randomBoxes.length < MaxBoxes) {
    randomBoxes.push(makeRandomBox());
  }

  const secondsSinceLastRender = (new Date().getTime() - lastTime) / 1000;

  randomBoxes.map((box) => {
    box.box.position.y -= box.yVelocity * secondsSinceLastRender;
    box.yVelocity += ForceOfGravity * secondsSinceLastRender;

    if (box.box.position.y < -(camera.position.y + getFrustum())) {
      box.box.position.y = -(camera.position.y + getFrustum()); // Ensure we don't double trigger this
      box.yVelocity = -box.yVelocity * BounceElasticity;
    }
  });

  randomBoxes = randomBoxes.filter((box) => {
    // Boxes that are at rest (or close enough) should be removed
    if (
      box.box.position.y == -(camera.position.y + getFrustum()) &&
      Math.abs(box.yVelocity) < MinBoxVelocity
    ) {
      scene.remove(box.box);
      return false;
    }

    return true;
  });

  lastTime = new Date().getTime();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
