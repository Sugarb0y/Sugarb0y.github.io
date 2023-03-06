import * as THREE from 'three';

let camera, scene, renderer;

let skinnedMesh, skeleton, bones, skeletonHelper;

let raycaster;
const pointer = new THREE.Vector2();
let anIntersectableObject;	
let intersectObject;

let groupIntersectables;

let aDragObject = null;
let click;
let theta = 0;
let radius = 100;

let prevObj = null;

let boxes = [];
let dragBone = null;   

const segmentHeight = 6;
    const segmentCount = 4;
    const height = segmentHeight * segmentCount;
    const halfHeight = height * 0.5;

    const sizing = {
            segmentHeight,
            segmentCount,
            height,
            halfHeight
    };
    
    
init();
animate();

function init() {

    scene = new THREE.Scene();
    groupIntersectables = new THREE.Group();
    let dirLight = new THREE.DirectionalLight ( 0xffffff, 0.5 );
    scene.add( dirLight );
        
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
    scene.add( hemiLight );
    
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 60;
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );
        
    initSkinnedMesh();
    
    
    raycaster = new THREE.Raycaster();
    window.addEventListener( 'mousemove', onPointerMove );
    window.addEventListener( 'pointerdown', onPointerDown );
    window.addEventListener( 'pointerup', onPointerUp );

}

function onPointerDown( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    
    const found = raycaster.intersectObjects(groupIntersectables.children, true);
    if (found.length) {
        if(found[0].object.isDraggable){
            found[0].object.currentDrag = true;     
            aDragObject = found[0].object;
            aDragObject.material.emissive.setHex( anIntersectableObject.HexSelected );
            click = {...pointer};
            for ( let i = 0; i < 5; i ++ ) {
                if (boxes[i] === aDragObject){
                    dragBone = i;
                }
            }
        }
    }
    
}

function onPointerUp( event ) {
    if(aDragObject !== null){
        aDragObject.currentDrag = false;
        aDragObject.material.emissive.setHex( anIntersectableObject.HexNotSelected );
    }
}

function onPointerMove( event ) {
    if(aDragObject !== null){
        if( aDragObject.currentDrag){
            
            let count = 1;
             for ( let i = dragBone; i < 5; i ++ ) {
                 boxes[i].position.x  += count*(-((click.x) -(( (event.clientX) / window.innerWidth ) * 2 - 1)));
                 boxes[i].position.y += count*(-((click.y) -(- ( (event.clientY) / window.innerHeight ) * 2 + 1)));
                 skeleton.bones[i].position.x += -(click.x -(( event.clientX / window.innerWidth ) * 2 - 1));
                 skeleton.bones[i].position.y += -(click.y -(- ( event.clientY / window.innerHeight ) * 2 + 1));
                 count++;
             }
    }
    }
}


function initSkinnedMesh() {

    

    const geometry = createGeometry( sizing );
    
    const material = new THREE.MeshStandardMaterial( {
            color: 0x156289,
           emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
            wireframe: true
    } );


    const bones = createBones( sizing );
    
    skeleton = new THREE.Skeleton( bones );
    
    skinnedMesh = new THREE.SkinnedMesh( geometry, material );

    const rootBone = skeleton.bones[ 0 ];
    
    skinnedMesh.add( rootBone );

    skinnedMesh.bind( skeleton );
    skinnedMesh.isDraggable = false;

    scene.add( skinnedMesh );
    
    skeletonHelper = new THREE.SkeletonHelper( skinnedMesh );
    skeletonHelper.material.linewidth = 5;
    scene.add( skeletonHelper );

}

function createGeometry( sizing ) {

    const geometry = new THREE.CylinderGeometry(
            5, // radiusTop
            5, // radiusBottom
            sizing.height, // height
            8, // radiusSegments
            sizing.segmentCount * 1, // heightSegments
            true // openEnded
    );

    const position = geometry.attributes.position;

    const vertex = new THREE.Vector3();

    const skinIndices = [];
    const skinWeights = [];
    
    

    for ( let i = 0; i < position.count; i ++ ) {

            vertex.fromBufferAttribute( position, i );

            const y = ( vertex.y + sizing.halfHeight );
            
            

            const skinIndex = Math.floor( y / sizing.segmentHeight );
            const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

            skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
            skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

    }

    geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
    geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

    return geometry;

    }

function createBones( sizing ) {

    bones = [];

    let prevBone = new THREE.Bone();
    bones.push( prevBone );
    prevBone.position.y = - sizing.halfHeight;
    
    const aBoxGeometry = new THREE.BoxGeometry( 10, 3, 6 );
    
    let material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );

    anIntersectableObject = new THREE.Mesh( aBoxGeometry, material );
    anIntersectableObject.position.set(0, prevBone.position.y, 0);

    anIntersectableObject.HexNotSelected = material.emissive.getHex();
    anIntersectableObject.HexSelected =  0xff0000;
    anIntersectableObject.currentIntersected = false;
    anIntersectableObject.isDraggable = true;
    anIntersectableObject.currentDrag = false;
    
    boxes[0] = anIntersectableObject;
    
    groupIntersectables.add(anIntersectableObject);

    let aux = - sizing.halfHeight;
    aux += sizing.segmentHeight;
    for ( let i = 0; i < sizing.segmentCount; i ++ ) {

            const bone = new THREE.Bone();
            bone.position.y = sizing.segmentHeight;
            
            const aBoxGeometry = new THREE.BoxGeometry( 10, 3, 6 );
    
            let material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );

            anIntersectableObject = new THREE.Mesh( aBoxGeometry, material );
            anIntersectableObject.position.set(0,aux, 0);
            aux += sizing.segmentHeight;
            anIntersectableObject.HexNotSelected = material.emissive.getHex();
            anIntersectableObject.HexSelected =  0xff0000;
            anIntersectableObject.currentIntersected = false;
            anIntersectableObject.isDraggable = true;
            anIntersectableObject.currentDrag = false;
            boxes[i+1]= anIntersectableObject;
            
            groupIntersectables.add(anIntersectableObject);
            
            bones.push( bone );
            prevBone.add( bone );
            prevBone = bone;

    }
    scene.add(groupIntersectables);
    return bones;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    

    renderer.render( scene, camera );

}