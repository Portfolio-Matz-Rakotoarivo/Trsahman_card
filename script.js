
let scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load('background.png', function(texture) {
    scene.background = texture;
});
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let group = new THREE.Group();
scene.add(group);

let radius = 3.2;
let cardGeometry = new THREE.BoxGeometry(1, 1.4, 0.01);

for (let i = 0; i < 14; i++) {
    let angle = (i / 14) * Math.PI * 2;
    let front = new THREE.TextureLoader().load(`card${i + 1}_front.png`);
    let back = new THREE.TextureLoader().load(`card${i + 1}_back.png`);
    let sideMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
    let materials = [
        sideMat, sideMat, sideMat, sideMat,
        new THREE.MeshBasicMaterial({ map: front }),
        new THREE.MeshBasicMaterial({ map: back })
    ];
    let card = new THREE.Mesh(cardGeometry, materials);
    card.position.x = Math.cos(angle) * radius;
    card.position.z = Math.sin(angle) * radius;
    card.lookAt(camera.position);
    card.userData = {
        baseAngle: card.rotation.y,

        currentFlip: 0,
        isFlipped: false
    };
    group.add(card);
}

camera.position.set(0, 0.2, 4);
camera.lookAt(0, 0, 0);

window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(group.children);
    if (intersects.length > 0) {
        let card = intersects[0].object;
        card.userData.isFlipped = !card.userData.isFlipped;
    }
});

let isDragging = false, previousMouseX = 0;
window.addEventListener('mousedown', e => {
    isDragging = true;
    previousMouseX = e.clientX;
});
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', e => {
    if (isDragging) {
        let delta = (e.clientX - previousMouseX) * 0.005;
        group.rotation.y += delta;
        previousMouseX = e.clientX;
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) group.rotation.y += 0.002;

    group.children.forEach(card => {
        let target = card.userData.isFlipped ? Math.PI : 0;
        let delta = target - card.userData.currentFlip;
        if (Math.abs(delta) > 0.01) {
            card.userData.currentFlip += delta * 0.15;
        } else {
            card.userData.currentFlip = target;
        }
        card.rotation.y = card.userData.baseAngle + card.userData.currentFlip;
    });

    renderer.render(scene, camera);
}
animate();
