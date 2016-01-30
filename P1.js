// UBC CPSC 314 (2015W2) -- P1
// HAVE FUN!!! :)

// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,1000); // view angle, aspect ratio, near, far
camera.position.set(45,20,40);
camera.lookAt(scene.position);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera);

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
   }

// SETUP HELPER GRID
// Note: Press Z to show/hide
var gridGeometry = new THREE.Geometry();
var i;
for(i=-50;i<51;i+=2) {
    gridGeometry.vertices.push( new THREE.Vector3(i,0,-50));
    gridGeometry.vertices.push( new THREE.Vector3(i,0,50));
    gridGeometry.vertices.push( new THREE.Vector3(-50,0,i));
    gridGeometry.vertices.push( new THREE.Vector3(50,0,i));
}

var gridMaterial = new THREE.LineBasicMaterial({color:0xBBBBBB});
var grid = new THREE.Line(gridGeometry,gridMaterial,THREE.LinePieces);

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

//////////////////// HELPER FUNCTIONS ////////////////////////////
var matrixStack = [];

function identityMatrix() {
  return new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
}

// function pushMatrix()
// Pushes a matrix onto the matrix stack (scene graph)
// Inputs: a matrix to be added
function pushMatrix (m) {
  var m2 = new Matrix4(m);
  matrixStack.push(m2);
}

// function popMatrix()
// Removes a matrix from the top of stack
function popMatrix() {
  return matrixStack.pop();
}



function translateMatrix(x, y, z, matrix){
  var translation = new THREE.Vector4().set(x,y,z,1);
  //TODO complete the matrix multiplication
  return matrix.multiplyMatrices()
}


//////////////////////// MODELLING ////////////////////////////////
// MATERIALS
// Note: Feel free to be creative with this! 
var normalMaterial = new THREE.MeshNormalMaterial();

// function drawCube()
// Draws a unit cube centered about the origin.
// Note: You will be using this for all of your geometry
function makeCube() {
  var unitCube = new THREE.BoxGeometry(1,1,1);
  return unitCube;
}

// GEOMETRY 
var torsoGeometry = makeCube();
var scale_torso = new THREE.Matrix4().set(5,0,0,0, 0,5,0,0, 0,0,8,0, 0,0,0,1);
torsoGeometry.applyMatrix(scale_torso);

var headGeometry = makeCube();
var scale_head = new THREE.Matrix4().set(4,0,0,0, 0,4,0,0, 0,0,3,0, 0,0,0,1);
headGeometry.applyMatrix(scale_head);


// TO-DO: SPECIFY THE REST OF YOUR STAR-NOSE MOLE'S GEOMETRY. 
// Note: You will be using transformation matrices to set the shape. 
// Note: You are not allowed to use the tools Three.js provides for 
//       rotation, translation and scaling.
// Note: The torso has been done for you (but feel free to modify it!)  
// Hint: Explicity declare new matrices using Matrix4().set     



// TRANSFORMATION MATRICES
var torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0, 0,0,0,1);
var headTorsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,5.5, 0,0,0,1);

// TO-DO: INITIALIZE THE REST OF YOUR MATRICES 
// Note: Use of parent attribute is not allowed.
// Hint: Keep hierarchies in mind!   
// Hint: Play around with the headTorsoMatrix values, what changes in the render? Why?         

// CREATE BODY
var torso = new THREE.Mesh(torsoGeometry,normalMaterial);
torso.setMatrix(torsoMatrix);
scene.add(torso);


// CREATE HEAD
var head = new THREE.Mesh(headGeometry, normalMaterial);
head.setMatrix(headTorsoMatrix);
scene.add(head);



// TO-DO: PUT TOGETHER THE REST OF YOUR STAR-NOSED MOLE AND ADD TO THE SCENE!
// Hint: Hint: Add one piece of geometry at a time, then implement the motion for that part. 
//             Then you can make sure your hierarchy still works properly after each step.



// APPLY DIFFERENT JUMP CUTS/ANIMATIONS TO DIFFERNET KEYS
// Note: The start of "U" animation has been done for you, you must implement the hiearchy and jumpcut.
// Hint: There are other ways to manipulate and grab clock values!!
// Hint: Check THREE.js clock documenation for ideas.
// Hint: It may help to start with a jumpcut and implement the animation after.
// Hint: Where is updateBody() called?
var clock = new THREE.Clock(true);

var p0; // start position or angle
var p1; // end position or angle
var time_length; // total time of animation
var time_start; // start time of animation
var time_end; // end time of animation
var p; // current frame
var animate = false; // animate?
var jumpcut = false; // jumpcut?

// function init_animation()
// Initializes parameters and sets animate flag to true.
// Input: start position or angle, end position or angle, and total time of animation.
function init_animation(p_start,p_end,t_length){
  p0 = p_start;
  p1 = p_end;
  time_length = t_length;
  time_start = clock.getElapsedTime();
  time_end = time_start + time_length;
  if(!jumpcut) {animate = true;} // flag for animation
  return;
}

// function execute_animation()
// Updates the animation 
// Input: desired action (passed as function)
function update_animation(action) {
    switch(true)
  {
     case(animate):
      var time = clock.getElapsedTime(); // t seconds passed since the clock started.

      if (time > time_end){
        p = p1;
        animate = false;
        break;
      }

      p = (p1 - p0)*((time-time_start)/time_length) + p0; // current frame
      action(p); 
    break;

    case(jumpcut):
      p = p1;
      action(p);
    break;
  }
}

function updateBody() {

  function rotateBodyZ(p) {
    var rotateZ = new THREE.Matrix4().set(1,        0,         0,        0, 
                                          0,  Math.cos(-p), -Math.sin(-p), 0, 
                                          0,  Math.sin(-p),  Math.cos(-p), 0,
                                          0,        0,         0,        1);
    //multiply torsoMatrix by some Rotation
    var torsoRotMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix,rotateZ);
    torso.setMatrix(torsoRotMatrix);
    //update heiarchy accordingly
    headTorsoMatrix.multiplyMatrices()



  }

  if(key == "U" || key == "M" || key == "E"){
    update_animation(rotateBodyZ);
  }
} 

function updateHead() {
  
  function rotateHeadY(p) {
    var rotateY = new THREE.Matrix4().set(Math.cos(-p),  0,  Math.sin(-p),  0, 
                                                0,       1,       0,        0, 
                                          -Math.sin(-p), 0,  Math.cos(-p),  0,
                                                0,       0,       0,        1);
    // have a identitiy matrix
    // translate by torso matrix
    // translate by the headTorsoMatrix (which depends on torso)
    // rotate by rotateHeadY
    var headMatrix = identityMatrix();
    headMatrix.multiplyMatrices(torsoMatrix, headTorsoMatrix);
    headMatrix.multiply(rotateHeadY);

    //headTorsoMatrix.multiply(torsoMatrix);
    //var headRotMatrix = new THREE.Matrix4().multiplyMatrices(headTorsoMatrix, rotateY);
    head.setMatrix(headMatrix);
  }

  if(key == "H" || key == "G"){
    update_animation(rotateHeadY);
  }
}


// LISTEN TO KEYBOARD
// Hint: Pay careful attention to how the keys already specified work!
var keyboard = new THREEx.KeyboardState();
var grid_state = false;
var key = "M"
keyboard.domElement.addEventListener('keydown',function(event){
  if (event.repeat)
    return;
  if(keyboard.eventMatches(event,"Z")){  // Z: Reveal/Hide helper grid
    grid_state = !grid_state;
    grid_state? scene.add(grid) : scene.remove(grid);}   
  else if(keyboard.eventMatches(event,"0")){    // 0: Set camera to neutral position, view reset
    camera.position.set(45,0,0);
    camera.lookAt(scene.position);}
  else if(keyboard.eventMatches(event, "space")){   // SPACEBAR: switch to jumpcut mode
    jumpcut = !jumpcut;}
  else if(keyboard.eventMatches(event,"U")){    // U: Tilt the body up
    if(key == "E") {init_animation(-Math.PI/4,0,1), key = "M"}
    else if(key == "M") {init_animation(0, Math.PI/4,1), key = "U"}
    else {init_animation(p1,p0,time_length), key = "M"}} 
  else if(keyboard.eventMatches(event,"E")){    // E: Tile the body down
    if(key == "U") {init_animation(Math.PI/4,0,1), key = "M"}
    else if(key == "M") {init_animation(0, -Math.PI/4,1), key = "E"}
    else {init_animation(p1,p0,time_length), key = "M"}}
  else if(keyboard.eventMatches(event,"H")){   // H: Rotate head right
    (key == "H")? init_animation(p1,p0,time_length) : (init_animation(0,Math.PI/4,1), key = "H")} 
  else if(keyboard.eventMatches(event,"G")){  // G: Rotate head left
    (key == "G")? init_animation(p1,p0,time_length) : (init_animation(0,-Math.PI/4,1), key = "G")} 
  }); 


  // TO-DO: BIND KEYS TO YOUR JUMP CUTS AND ANIMATIONS
  // Note: Remember spacebar sets jumpcut/animate! 
  // Hint: Look up "threex.keyboardstate by Jerome Tienne" for more info.

// SETUP UPDATE CALL-BACK
// Hint: It is useful to understand what is being updated here, the effect, and why.
function update() {
  updateBody();
  updateHead();

  requestAnimationFrame(update);
  renderer.render(scene,camera);
}

update();