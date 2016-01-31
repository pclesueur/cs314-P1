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

// function drawCube()
// Draws a unit cube centered about the origin.
function makeCube() {
  var unitCube = new THREE.BoxGeometry(1,1,1);
  return unitCube;
}

// function pushMatrix()
// Pushes a matrix onto the matrix stack (scene graph)
// Inputs: a matrix to be added
function pushMatrix(m){
  var m2 = identityMatrix();
  m2.copy(m);
  matrixStack.push(m2);
}

// function popMatrix()
// Removes a matrix from the top of stack
function popMatrix(){
  return matrixStack.pop();
}

// function translateMatrix()
// translates given matrix by x, y, z
function translateMatrix(x, y, z, matrix){
  var translation = new THREE.Matrix4().set(1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1);
  return matrix.multiply(translation);
}

// function scaleMatrix()
// scales given matrix by x, y, z
function scaleMatrix(x, y, z, matrix){
  var scale = new THREE.Matrix4().set(x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1);
  return matrix.multiply(scale);
}

// function rotateMatrix
// Note:  can only rotate by one axis. Oblique rotations are not accepted. TODO: make robust.
function rotateMatrix(p, x, y, z, matrix){
  var rotY = new THREE.Matrix4().set(Math.cos(-p),  0,  Math.sin(-p),  0, 
                                           0,       1,       0,        0, 
                                     -Math.sin(-p), 0,  Math.cos(-p),  0,
                                           0,       0,       0,        1);

  var rotX = new THREE.Matrix4().set(1,        0,         0,          0, 
                                     0,  Math.cos(-p), -Math.sin(-p), 0, 
                                     0,  Math.sin(-p),  Math.cos(-p), 0,
                                     0,        0,         0,          1);

  var rotZ = new THREE.Matrix4().set(Math.cos(-p), -Math.sin(-p), 0, 0, 
                                     Math.sin(-p),  Math.cos(-p), 0, 0, 
                                         0,            0,         1, 0,
                                         0,            0,         0, 1);
  if(x == 1)      {return matrix.multiply(rotX);}
  else if(y == 1) {return matrix.multiply(rotY);}
  else            {return matrix.multiply(rotZ);}
}

// function rotateAroundPoint()
// Returns a rotation matrix which rotates an object around a point p
// Inputs, p(x,y,z) from local origin, amount to rotate, axis to rotate by (x, y, z),
//         matrix that is being updated.
function rotateAroundPoint(amount, p1, p2, p3, x, y, z, matrix){
  // translate to origin, rotate, translate back.
  matrix = translateMatrix(-p1, -p2, -p3, matrix);
  matrix = rotateMatrix(amount, x, y, z, matrix);
  return translateMatrix(p1, p2, p3, matrix);
}

function handleTendrals(m){

  // Small tendrals left
  for(i = 0; i < 2; i++){
    var m_cur = identityMatrix();
    m_cur.copy(m);
    m_cur = translateMatrix(0.2,0,-0.25, m_cur);
    m_cur = rotateMatrix(i*Math.PI, 0, 0, 1, m_cur);
    m_cur = translateMatrix(0, 1.25, 0, m_cur);
    m_cur = rotateAroundPoint(-Math.PI/3, 0,(1.5/2),0, 1, 0, 0, m_cur);
    small_tendrals[i].setMatrix(m_cur);
  }

  // Small tendrals right
  for(i = 2; i < 4; i++){
    var m_cur = identityMatrix();
    m_cur.copy(m);
    m_cur = translateMatrix(-0.2,0,-0.25, m_cur);
    m_cur = rotateMatrix(i*Math.PI, 0, 0, 1, m_cur);
    m_cur = translateMatrix(0, 1.25, 0, m_cur);
    m_cur = rotateAroundPoint(-Math.PI/3, 0,(1.5/2),0, 1, 0, 0, m_cur);
    small_tendrals[i].setMatrix(m_cur);
  }

  // Large tendrals left
  for(i = 0; i < 8; i++){
    var m_cur = identityMatrix();
    m_cur.copy(m);
    m_cur = translateMatrix(0.55,0,-0.25, m_cur);
    m_cur = rotateMatrix((i*(Math.PI/7)), 0, 0, 1, m_cur);
    m_cur = translateMatrix(0, 1.25, 0, m_cur);
    m_cur = rotateAroundPoint(-Math.PI/4, 0,(1.5/2),0, 1, 0, 0, m_cur);
    large_tendrals[i].setMatrix(m_cur);
  }

  // Large tendrals right
  for(i = 8; i < 16; i++){
    var m_cur = identityMatrix();
    m_cur.copy(m);
    m_cur = translateMatrix(-0.55,0,-0.25, m_cur);
    m_cur = rotateMatrix((i-1)*(Math.PI/7), 0, 0, 1, m_cur);
    m_cur = translateMatrix(0, 1.25, 0, m_cur);
    m_cur = rotateAroundPoint(-Math.PI/4, 0,(1.5/2),0, 1, 0, 0, m_cur);
    large_tendrals[i].setMatrix(m_cur);
  }
}

// functions to reinitialize transformation matrices
function createTorsoMatrix() {return new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0, 0,0,0,1);}
function createHeadTorsoMatrix() {return new THREE.Matrix4().set(1,0,0,0, 0,1,0,-0.25, 0,0,1,5, 0,0,0,1);}
function createTailMatrix() {return new THREE.Matrix4().set(1,0,0,0, 0,1,0,-1, 0,0,1,-6.0, 0,0,0,1);}
function createSmallTendralMatrix() {return new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,1.1, 0,0,0,1);}
function createLargeTendralMatrix() {return new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,1.1, 0,0,0,1);}

//////////////////////// MODELLING ////////////////////////////////
// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();

// GEOMETRY 
var torsoGeometry = makeCube();
var scale_torso = new THREE.Matrix4().set(5,0,0,0, 0,5,0,0, 0,0,8,0, 0,0,0,1);
torsoGeometry.applyMatrix(scale_torso);

var headGeometry = makeCube();
var scale_head = new THREE.Matrix4().set(4,0,0,0, 0,4,0,0, 0,0,2,0, 0,0,0,1);
headGeometry.applyMatrix(scale_head);

var nose1Geometry = makeCube();
var scale_nose1 = new THREE.Matrix4().set(3,0,0,0, 0,3,0,0, 0,0,1.5,0, 0,0,0,1)
nose1Geometry.applyMatrix(scale_nose1)

var nose2Geometry = makeCube();
var scale_nose2 = new THREE.Matrix4().set(2.0,0,0,0, 0,1.5,0,0, 0,0,2,0, 0,0,0,1)
nose2Geometry.applyMatrix(scale_nose2)

var tailGeometry = makeCube();
var scale_tail = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,4,0, 0,0,0,1)
tailGeometry.applyMatrix(scale_tail);

var smallTendralGeometry = makeCube();
var scale_small_tendral = new THREE.Matrix4().set(0.25,0,0,0, 0,1,0,0, 0,0,0.25,0, 0,0,0,1)
smallTendralGeometry.applyMatrix(scale_small_tendral);

var largeTendralGeometry = makeCube();
var scale_large_tendral = new THREE.Matrix4().set(0.25,0,0,0, 0,1.5,0,0, 0,0,0.25,0, 0,0,0,1)
largeTendralGeometry.applyMatrix(scale_large_tendral);


// CREATE GEOMETRY
var torso = new THREE.Mesh(torsoGeometry,normalMaterial);
scene.add(torso);
var head = new THREE.Mesh(headGeometry, normalMaterial);
scene.add(head);
var nose1 = new THREE.Mesh(nose1Geometry, normalMaterial);
scene.add(nose1);
var nose2 = new THREE.Mesh(nose2Geometry, normalMaterial);
scene.add(nose2);
var tail = new THREE.Mesh(tailGeometry, normalMaterial);
scene.add(tail);
var smallTendral = new THREE.Mesh(smallTendralGeometry, normalMaterial);
scene.add(smallTendral);
var largeTendral = new THREE.Mesh(largeTendralGeometry, normalMaterial);
scene.add(largeTendral);

  // create large tendrals
var large_tendrals = [];
for(i = 0; i < 16; i++) {
  var current_tendral = largeTendral.clone();
  large_tendrals[i] = current_tendral;
  scene.add(current_tendral);
}

// create small tendrals
var small_tendrals = [];
for(i = 0; i < 4; i++) {
  var current_tendral = smallTendral.clone();
  small_tendrals[i] = current_tendral;
  scene.add(current_tendral);
}

// TRANSFORMATION MATRICES
var torsoMatrix = createTorsoMatrix();
var headTorsoMatrix = createHeadTorsoMatrix();
var tailMatrix = createTailMatrix();
var smallTendralMatrix = createSmallTendralMatrix();
var largeTendralMatrix = createLargeTendralMatrix();

// DRAW MOLE
function drawGeometry() {
  var drawMatrix = identityMatrix();

  //draw body
  drawMatrix.multiply(torsoMatrix);
  torso.setMatrix(drawMatrix);

  pushMatrix(drawMatrix);       //save a copy of the body matrix

      // draw head
      drawMatrix.multiply(headTorsoMatrix);
      head.setMatrix(drawMatrix);

      // draw nose
      drawMatrix = translateMatrix(0, -0.25, 1.5, drawMatrix);
      nose1.setMatrix(drawMatrix);
      drawMatrix = translateMatrix(0, -0.25, 1.5, drawMatrix);
      nose2.setMatrix(drawMatrix);

      // draw tendrals
      drawMatrix = translateMatrix(0, 0, 1.1, drawMatrix);
      handleTendrals(drawMatrix);
      
  drawMatrix = popMatrix();      // return to body frame
  //pushMatrix(drawMatrix);

      // draw tail
      drawMatrix.multiply(tailMatrix);
      tail.setMatrix(drawMatrix);

  drawMatrix = popMatrix();

      // feet

}


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
//  drawGeometry();
}

function updateBody() {

  function rotateBodyX(p) {
    torsoMatrix = createTorsoMatrix();
    var rotateX = identityMatrix();
    rotateX = rotateMatrix(p, 1, 0, 0, rotateX);
    torsoMatrix.multiply(rotateX);
  }

  if(key == "U" || key == "M" || key == "E"){
    update_animation(rotateBodyX);
  }
} 

function updateHead() {
  
  function rotateHeadY(p) {
    headTorsoMatrix = createHeadTorsoMatrix();
    var rotateY = identityMatrix();
    rotateY = rotateMatrix(p, 0, 1, 0, rotateY);
    headTorsoMatrix.multiply(rotateY);
  }

  if(key == "H" || key == "G"){
    update_animation(rotateHeadY);
  }
}

function updateTail() {

  function rotateTailY(p){
    tailMatrix = createTailMatrix();
    var rotateY = identityMatrix();
    rotateY = rotateMatrix(p, 0, 1, 0, rotateY);

    tailMatrix = translateMatrix(0, 0, 2, tailMatrix);
    tailMatrix.multiply(rotateY);
    tailMatrix = translateMatrix(0, 0, -2, tailMatrix);
  }

  if(key == "T" || key == "V"){
    update_animation(rotateTailY);
  }
}


// LISTEN TO KEYBOARD
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
  else if(keyboard.eventMatches(event,"H")){   // H: Rotate head left
    (key == "H")? init_animation(p1,p0,time_length) : (init_animation(0,Math.PI/4,1), key = "H")} 
  else if(keyboard.eventMatches(event,"G")){  // G: Rotate head right
    (key == "G")? init_animation(p1,p0,time_length) : (init_animation(0,-Math.PI/4,1), key = "G")} 
  else if(keyboard.eventMatches(event,"T")){   // T: Rotate tail left
    (key == "T")? init_animation(p1,p0,time_length) : (init_animation(0,Math.PI/4,1), key = "T")} 
  else if(keyboard.eventMatches(event,"V")){  // G: Rotate tail right
    (key == "V")? init_animation(p1,p0,time_length) : (init_animation(0,-Math.PI/4,1), key = "V")}   
  }); 


  // TO-DO: BIND KEYS TO YOUR JUMP CUTS AND ANIMATIONS

// SETUP UPDATE CALL-BACK
function update() {
  updateBody();
  updateHead();
  updateTail();

  drawGeometry();
  requestAnimationFrame(update);
  renderer.render(scene,camera);
}

update();