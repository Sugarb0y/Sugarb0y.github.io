// Code goes here

$(document).ready(function(){
  
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
    
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 10000 );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height ); //set the size of the model - more is more tasking for the browser
    document.body.appendChild( renderer.domElement ); //create the canvas
  
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