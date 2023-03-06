import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let raycaster;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let group;

init();
animate();
let vertice1;
let vertice2;
let sphere2;
let sphere;

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    const floorGeometry = new THREE.PlaneGeometry( 4, 4 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
            color: 0xeeeeee,
            roughness: 1.0,
            metalness: 0.0
    } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add( floor );

    scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set( 4096, 4096 );
    scene.add( light );

    group = new THREE.Group();
    scene.add( group );

    const geometries = [
            new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
            new THREE.ConeGeometry( 0.2, 0.2, 64 ),
            new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
            new THREE.IcosahedronGeometry( 0.2, 8 ),
            new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];
/*
    for ( let i = 0; i < 50; i ++ ) {

            const geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
            const material = new THREE.MeshStandardMaterial( {
                    color: Math.random() * 0xffffff,
                    roughness: 0.7,
                    metalness: 0.0
            } );

            const object = new THREE.Mesh( geometry, material );

            object.position.x = Math.random() * 4 - 2;
            object.position.y = Math.random() * 2;
            object.position.z = Math.random() * 4 - 2;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.setScalar( Math.random() + 0.5 );

            object.castShadow = true;
            object.receiveShadow = true;

            group.add( object );

    }
*/
    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );

    // controllers

    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    //

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );

    raycaster = new THREE.Raycaster();

    //

    window.addEventListener( 'resize', onWindowResize );
    

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onSelectStart( event ) {

    let controller = event.target;
    if (vertice1 == undefined){
    	vertice1 = controller.position.clone();
    	console.log(vertice1);
    	let sferaGeo = new THREE.SphereGeometry(20,32,16);
    	let material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
        sphere = new THREE.Mesh(sferaGeo,material);
        sphere.position.copy( vertice1);
        scene.add( sphere );
        }
     else if (vertice2 == undefined){
    	vertice2 = controller.position.clone();
    	console.log(vertice2);
    	let sferaGeo2 = new THREE.SphereGeometry(30,32,16);
    	let material2 = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
        sphere2 = new THREE.Mesh(sferaGeo2,material2);
        sphere2.position.copy(vertice2);
        scene.add( sphere2 );
        let cubeDiagonal = new THREE.Vector3().copy(vertice2).sub(vertice1).length(); // cube's diagonal
	let center = new THREE.Vector3().copy(vertice1).add(vertice2).multiplyScalar(0.5); // cube's center

	let cubeSide = (cubeDiagonal * Math.sqrt(3)) / 3; // cube's edge's length via cube's diagonal

	let cubeGeom = new THREE.BoxGeometry(cubeSide, cubeSide, cubeSide);
	cubeGeom.rotateY(Math.PI * 0.25); // rotate around Y
	cubeGeom.rotateX(Math.atan(Math.sqrt(2) * 0.5)); // rotate around X, using angle between cube's diagonal and its projection on a cube's face
	let cube = new THREE.Mesh(cubeGeom, new THREE.MeshBasicMaterial( {color: 0x00ffff} ));
	cube.position.copy(center); // set position of the cube
	cube.lookAt(vertice1); // let Three.js do the job for us
	scene.add(cube)
        }
    else{
    	vertice2 == undefined;
    	vertice1 == undefined;
    }

}

function onSelectEnd( event ) {



}

function getIntersections( controller ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects( group.children, false );

}

function intersectObjects( controller ) {

}

function cleanIntersected() {


}

//

function animate() {

    renderer.setAnimationLoop( render );

}

function render() {

    cleanIntersected();

    intersectObjects( controller1 );
    intersectObjects( controller2 );

    renderer.render( scene, camera );

}

