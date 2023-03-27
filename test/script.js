// Code goes here
import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

$(document).ready(function(){
  
  

	let container;
	let camera, scene, renderer;
	let controller1, controller2;
	let controllerGrip1, controllerGrip2;
	
	let raycaster;
	
  var scene, camera, renderer;
  var width = 500;
  var height = 500;
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
  
  function init(){
    scene = new THREE.Scene();
    // set:
    // Field of view
    // Aspect ratio - width of the element divided by the height
    // Near and far clipping ends
    
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
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );
	
	ontroller1 = renderer.xr.getController( 0 );
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


    // Circle
    /*var circleGeometry = new THREE.CircleGeometry( 10, 32, 0, Math.PI/2 );
    var circle = new THREE.Mesh( circleGeometry, material );
    scene.add( circle ); 
    */
    // Cylinder
    var cylinderGeometry = new THREE.CylinderGeometry( 50, 50, 25, 32,32,false );
    var cylinderMesh = new THREE.Mesh( cylinderGeometry, new THREE.MeshLambertMaterial({ color: 0xffffff }) );
    //scene.add( cylinder );
    //cylinder.position.set(0,0,100);
    var cylinder_bsp = new ThreeBSP (cylinderMesh);
    
    cylinderGeometry = new THREE.CylinderGeometry( 30, 30, 25, 32,1,false );
    cylinderMesh = new THREE.Mesh( cylinderGeometry, new THREE.MeshLambertMaterial({ color: 0xffffff }) );
    var cylinder_bsp_sub = new ThreeBSP (cylinderMesh);
    
		var subtract_bsp = cylinder_bsp.subtract( cylinder_bsp_sub );
		
		var boxGeormetry = new THREE.BoxGeometry(50, 25, 50);
		var boxMesh = new THREE.Mesh( boxGeormetry, new THREE.MeshLambertMaterial({ color: 0xffffff }) );
		//scene.add(boxMesh);
		boxMesh.position.set(25,0,25);
		var subtract_bsp2 = subtract_bsp.subtract(new ThreeBSP (boxMesh)); //circle with missing 
		boxMesh.position.set(-25,0,25);
		subtract_bsp2 = subtract_bsp2.subtract(new ThreeBSP (boxMesh)); //circle with missing 
		subtract_bsp = subtract_bsp.subtract(subtract_bsp2);
		boxMesh.position.set(-25,0,-25);
		subtract_bsp2 = subtract_bsp2.subtract(new ThreeBSP (boxMesh)); //circle with missing 
		var result = subtract_bsp2.toMesh( material );
		
		
		result.geometry.computeVertexNormals();
		result.position.set(0,0,0);
		scene.add( result );
    
    // set camera and controls
    camera.position.set(0,300,75); //move camera a bit
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    
    
    // Light
    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);
    
    // set its position
    pointLight.position = camera.position; //light will follow the camera
    
    // add light to the scene
    scene.add(pointLight);
  }
  
  init();
  animate();
  
  function animate() 
  {
    requestAnimationFrame( animate );
  	render();		
  	update();
  }

function update()
{
	controls.update();
	$("#x").text(camera.position.x);
	$("#y").text(camera.position.y);
	$("#z").text(camera.position.z);
}

function render() 
{	
	renderer.render( scene, camera );
}

 /* function render() {
  	requestAnimationFrame(render); //create a frame recursively
  	renderer.render(scene, camera);// render with scene and camera
  //	cube.rotation.x += 0.1; //change position of the cube
  //  cube.rotation.y += 0.1;
    
  //  circle.rotation.x += 0.1; //change position of the cube
  //  circle.rotation.y += 0.1;

    //cube.position.z += 0.001;
  }
  render();*/
})