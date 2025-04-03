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

// Resizing
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.aspectRatio = window.innerWidth / window.innerHeight

    // Update camera
    camera.aspect = sizes.aspectRatio
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/***********
 ** SCENE ** 
 ***********/
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
camera.position.set(0, 12, -20)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/***********
** LIGHTS **
***********/
// Directional Light
const directionalLight = new THREE.DirectionalLight(0x404040, 100)
scene.add(directionalLight)

/***********
** MESHES **
************/
// Cube Geometry
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

const drawCube = (height, params) =>
{
    // Create cube material
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(params.color)
    })

    // Create cube
    const cube = new THREE.Mesh(cubeGeometry, material)

    // Position cube
    cube.position.x = (Math.random() - 0.5) * params.diameter
    cube.position.z = (Math.random() - 0.5) * params.diameter
    cube.position.y = height - 10

    // Scale cube
    cube.scale.x = params.scale
    cube.scale.y = params.scale
    cube.scale.z = params.scale

    // Dynamic Scale Term 1
    if(params.dynamicScaleTerm1)
    {
        cube.scale.x = height * 0.1
        cube.scale.y = height * 0.1
        cube.scale.z = height * 0.1
    }

    // Dynamic Scale Term 3
    if(params.dynamicScale) 
    {
        cube.scale.x = 1 / (height * 0.35);
        cube.scale.y = 1 / (height * 0.35);
        cube.scale.z = 1 / (height * 0.35);
    }


    // Randomize cube 
    if(params.randomized){
        cube.rotation.x = Math.random() * 2 * Math.PI
        cube.rotation.z = Math.random() * 2 * Math.PI
        cube.rotation.y = Math.random() * 2 * Math.PI
    }

    // Add cube to group
    params.group.add(cube)
}

/*******
** UI **
********/
// UI
const ui = new dat.GUI()

let preset = {}

// Groups
const group1 = new THREE.Group()
scene.add(group1)
const group2 = new THREE.Group()
scene.add(group2)
const group3 = new THREE.Group()
scene.add(group3)

const uiObj = {
    sourceText: "",
    saveSourceText() {
        saveSourceText()
    },
    term1: {
        term: 'button',
        color: '#00a3d7',
        diameter: 12,
        dynamicScale: false,
        dynamicScaleTerm1: true,
        group: group1,
        nCubes: 80,
        randomized: true,
        scale: 0.8
        // shrinkOverTime: false, 
    },
    term2: {
        term: 'steward',
        color: '#ff8300',
        diameter: 8,
        dynamicScale: false,
        group: group2,
        nCubes: 100,
        randomized: false,
        scale: 0.8
        // shrinkOverTime: false,
    },
    term3: {
        term: 'arthur',
        color: '#00ff00',
        diameter: 6,
        dynamicScale: true,
        group: group3,
        nCubes: 100,
        randomized: true,
        scale: 0.8
        // shrinkOverTime: true,
    },
    saveTerms() {
        saveTerms()
    },
    rotateCamera: false
}

// UI Functions
const saveSourceText = () =>
{
    // UI
    preset = ui.save()
    textFolder.hide()
    termsFolder.show()
    visualizeFolder.show()

    // Text Analysis
    tokenizeSourceText(uiObj.sourceText)

}
const saveTerms = () =>
{
    // UI
    preset = ui.save
    visualizeFolder.hide()
    cameraFolder.show()

    // Text Analysis
    findSearchTermInTokenizedText(uiObj.term1)
    findSearchTermInTokenizedText(uiObj.term2)
    findSearchTermInTokenizedText(uiObj.term3)
}

// Text Folder
const textFolder = ui.addFolder("Source Text")

textFolder
    .add(uiObj, 'sourceText')
    .name("Source Text")

textFolder
    .add(uiObj, 'saveSourceText')
    .name("Save")

// Terms, Visualize, and Camera Folders
const termsFolder = ui.addFolder("Search Terms")
const visualizeFolder = ui.addFolder("Visualize")
const cameraFolder = ui.addFolder("Camera")

termsFolder
    .add(uiObj.term1, 'term')
    .name("Term 1")

termsFolder
    .add(group1, 'visible')
    .name("Term 1 Visibility")

termsFolder
    .addColor(uiObj.term1, 'color')
    .name("Term 1 Color")

termsFolder
    .add(uiObj.term2, 'term')
    .name("Term 2")

termsFolder
    .add(group2, 'visible')
    .name("Term 2 Visibility")

termsFolder
    .addColor(uiObj.term2, 'color')
    .name("Term 2 Color")

termsFolder
    .add(uiObj.term3, 'term')
    .name("Term 3")

termsFolder
    .add(group3, 'visible')
    .name("Term 3 Visibility")    

termsFolder
    .addColor(uiObj.term3, 'color')
    .name("Term 3 Color")

visualizeFolder
    .add(uiObj, 'saveTerms')
    .name("Visualize")

cameraFolder
    .add(uiObj, 'rotateCamera')
    .name("Turntable")

// Terms, Visualize, and Camera folders are hidden by default
termsFolder.hide()
visualizeFolder.hide()
cameraFolder.hide()

/******************
** TEXT ANALYSIS **
******************/
// Variables
let parsedText, tokenizedText

// Parse and Tokenize sourceText
const tokenizeSourceText = (sourceText) =>
{
    // Strip periods and downcase sourceText
    parsedText = sourceText.replaceAll(".", "").toLowerCase()

    // Tokenize text
    tokenizedText = parsedText.split(/[^\w']+/)
}

// Find searchTerm in tokenizedText
const findSearchTermInTokenizedText = (params) =>
{
    for (let i = 0; i < tokenizedText.length; i++)
    {
        if(tokenizedText[i] === params.term){
            const height = (100 / tokenizedText.length) * i * 0.2

            for(let a = 0; a < params.nCubes; a++)
            {
                drawCube(height, params)
            }
        }
    }
}
/*******************
** ANIMATION LOOP **
********************/
const clock = new THREE.Clock()

const animation = () =>
{
    // Return elapsedTime
    const elapsedTime = clock.getElapsedTime()

    // Update OrbitControls
    controls.update()

    // Rotate Camera
    if(uiObj.rotateCamera)
    {
        camera.position.x = Math.sin(elapsedTime * 0.1) * 20
        camera.position.z = Math.cos(elapsedTime * 0.1) * 20
        camera.position.y = 5
        camera.lookAt(0, 0, 0)
    }

    // Group 1 Rotation
    group1.children.forEach(cube => {
        let heightFactor = (cube.position.x + 10) / 5;
        cube.rotation.y = elapsedTime * (0.1 + heightFactor);

        group1.position.y = Math.sin(elapsedTime)
    });    

    // Group 2 Rotation
    group2.rotation.y = elapsedTime * 0.6
    group2.position.x = Math.cos(elapsedTime)
    group2.position.z = Math.sin(elapsedTime)

    group2.children.forEach(cube => {
        let heightFactor = (cube.position.y + 10) / 20; 
        let scale = 0.1 + heightFactor * (8.5 - 0.5) * (0.5 - Math.abs(heightFactor - 0.5) * 1);
        cube.scale.set(scale, scale, scale);
    });



    // Renderer
    renderer.render(scene, camera)

    // Request next frame
    window.requestAnimationFrame(animation)
}

animation()