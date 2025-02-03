import * as THREE from "three"
import { OrbitControls } from "OrbitControls"
import * as dat from "lil-gui"

console.log(THREE)
console.log(dat)
console.log(OrbitControls)

/********** 
** SETUP **
**********/

// Sizes

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight
}

/**********
** SCENE **
**********/

// Canvas

const canvas = document.querySelector('.webgl')

// Scene

const scene = new THREE.Scene()
scene.background = new THREE.Color('gray')

// Camera

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.aspectRatio,
    0.1,
    100
)
scene.add(camera)
camera.position.set(-2, 3, -5)

// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)

// Controls

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/************
 ** MESHES **
 ***********/

// Test TorusKnot

const torusKnotGeometry = new THREE.TorusKnotGeometry(1.5, 0.3)
const torusKnotMaterial = new THREE.MeshNormalMaterial()
const testTorusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial)

scene.add(testTorusKnot)

// Plane

const planeGeometry = new THREE.PlaneGeometry(10, 10, 50, 50)
const planeMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('white'), 
    side: THREE.DoubleSide,
    wireframe: true
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = Math.PI * 0.5
scene.add(plane)

/******* 
** UI **
*******/

// UI

const ui = new dat.GUI()

// UI Object

const uiObject = {
    speed: 3,
    distance: 8,
    rotationSpeed: 0.5,
}

// Plane UI

const planeFolder = ui.addFolder('Plane')

planeFolder
.add(planeMaterial, 'wireframe')
.name("Toggle Wireframe")

// TorusKnot UI

const torusKnotFolder = ui
.addFolder('TorusKnot')

torusKnotFolder
.add(uiObject, 'speed')
.min(0.1)
.max(10)
.step(0.1)
.name('Movement Speed')

torusKnotFolder
.add(uiObject, 'distance')
.min(0.1)
.max(10)
.step(0.1)
.name('Movement Distance')

torusKnotFolder
.add(uiObject, 'rotationSpeed')
.min(0.01)
.max(1)
.step(0.01)
.name('Rotation Speed')

/*******************
** ANIMATION LOOP **
*******************/

const clock = new THREE.Clock()

const animation = () => {

    console.log("tick")

    // Return elapsedTime

    const elapsedTime = clock.getElapsedTime()

    // Animate TorusKnot Position 

    testTorusKnot.position.y = Math.sin(elapsedTime * uiObject.speed) * uiObject.distance
    testTorusKnot.rotation.x += uiObject.rotationSpeed
    testTorusKnot.rotation.y += uiObject.rotationSpeed
    testTorusKnot.rotation.z += uiObject.rotationSpeed

    // Update OrbitControls

    controls.update()

    // Renderer

    renderer.render(scene, camera)
    
    // Request next frame

    window.requestAnimationFrame(animation)
}

animation()