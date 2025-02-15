import * as THREE from "three"
import * as dat from "lil-gui"
import { OrbitControls } from "OrbitControls"

/**********
** SETUP **
***********/

// Sizes

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight
}

/***********
 ** SCENE ** 
 ***********/

// Canvas

const canvas = document.querySelector('.webgl')

// Scene

const scene = new THREE.Scene()
scene.background = new THREE.Color('black')

// Camera

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.aspectRatio,
    0.1,
    100
)
scene.add(camera)
camera.position.set(10, 2, 7.5)

// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Controls

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/***********
** MESHES **
************/

// Cave (Backdrop)

const caveGeometry = new THREE.PlaneGeometry(15.5, 7.5)
const caveMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('white'),
    side: THREE.DoubleSide
})
const cave = new THREE.Mesh(caveGeometry, caveMaterial)
cave.rotation.y = Math.PI * 0.5
cave.position.set(0, 0, -5) // Position the backdrop behind the smiley face
cave.receiveShadow = true // Ensure the cave receives shadows
scene.add(cave)

// Smiley Face

const smileyFace = new THREE.Group()

// Eyes
const eyeGeometry = new THREE.CircleGeometry(0.2, 32)
const eyeMaterial = new THREE.MeshNormalMaterial()
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
leftEye.position.set(-0.5, 0.5, 0)
leftEye.castShadow = true // Enable shadow casting for the left eye
smileyFace.add(leftEye)

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
rightEye.position.set(0.5, 0.5, 0)
rightEye.castShadow = true // Enable shadow casting for the right eye
smileyFace.add(rightEye)

// Smile
const smileGeometry = new THREE.RingGeometry(0.3, 0.5, 32, 32, Math.PI * 0.25, Math.PI * 0.75)
const smileMaterial = new THREE.MeshNormalMaterial()
const smile = new THREE.Mesh(smileGeometry, smileMaterial)
smile.castShadow = true // Enable shadow casting for the smile
smileyFace.add(smile)

smileyFace.position.set(0, 1, 0) // Center the smiley face
smileyFace.rotation.y = Math.PI // Rotate the smiley face to face the camera
smileyFace.castShadow = true // Enable shadow casting for the entire group
scene.add(smileyFace)

/*************
 ** LIGHTS **
 ************/

// Directional Light

const directionalLight = new THREE.DirectionalLight(
    new THREE.Color('white'),
    0.5
)
scene.add(directionalLight)
directionalLight.position.set(20, 4.1, 0)
directionalLight.target = cave
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048

// Directional Light Helper

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)

/*******
** UI **
********/

// UI

const ui = new dat.GUI()

const lightPositionFolder = ui.addFolder('Light Position')

lightPositionFolder
    .add(directionalLight.position, 'y')
    .min(-10)
    .max(10)
    .step(0.1)
    .name('Y')

lightPositionFolder
    .add(directionalLight.position, 'z')
    .min(-10)
    .max(10)
    .step(0.1)
    .name('Z')

/*******************
** ANIMATION LOOP **
********************/

const clock = new THREE.Clock()

const animation = () =>
{
    // Return elapsedTime

    const elapsedTime = clock.getElapsedTime()

    // Update directionalLightHelper

    directionalLightHelper.update()

    // Update OrbitControls

    controls.update()
    
    // Renderer

    renderer.render(scene, camera)

    // Request next frame

    window.requestAnimationFrame(animation)
}

animation()