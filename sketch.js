//----------------------------- Pose Net Variables---------------------------------//

let poseNet;
let video;
let BodyPredictions = [];
let prediction = [];
let leftWrist = [];
let rightWrist =[];
let ModelReadyVar = false;
let option = {maxPoseDetections: 1,flipHorizontal:true};
//---------------------------------------------------------------------------------//
//-------------------------------Game Variables------------------------------------//
//---------------------------------------------------------------------------------//

let m = 1; //multiplier
let dy = 5*m; // gravity (speed of the fruit and the bomb);


//------------------------------Canvas Screen Size-----------------------------------//

CanvasWidth = 640;
CanvasHeight = 480;

//-----------------------------position Variables----------------------------------//

let positionYFruit = 0*m  ;
let positionXFruit = 50*m  ;

let positionYBomb = -100*m  ;
let positionXBomb = 50*m  ;

let counterForShowingbomb = 3 ;

//--------------------------collision detection Variables--------------------------//

let poly = [];
var isFruitCollectedLeft = false; //for square with left
var isFruitCollectedRight = false; //for square with right
var bombTouchedLeft= false; //for circle with left
var bombTouchedRight = false;//for circle with right
//--------------------------------color Variables----------------------------------//

let colorofSquare ="white";
let colorofCircle ="white";

//--------------------------------Other Variables----------------------------------//

let score = 0 ;
let life = 3 ;

//-----------------------Size Variables for fruit and bomb-------------------------//

let SquareSize = 30*m;
let CircleRadius = 30*m;

//--------------------------------Screen Variables---------------------------------//

let inScreen1 = false ;
let inScreen2 = false;
let inScreen3 = false;
let Screen = 1 ;

//-----------------------------Position Possibilities------------------------------//

let possiblePositionsXFruit =[];
let possiblePositionsYFruit = [];
let possiblePositionsXBomb = [];
let possiblePositionsYBomb = [];

//--------------------------------soundfileVariables-------------------------------//

let sound_cc;
let sound_bc;
let sound_gv;
let sound_gvs;
let sound_db;
let sound_countdown;
let sound_background;

let timer = 3;
let frameCounter = 1;
//--------------------------------framerate Variables--------------------//
let fr = 60 ;
let framerateshow =fr;
let minimumFrameRate = fr;
//---------------------------------------------------------------------------------//
//-----------------------------End of Variable declarations------------------------//
//---------------------------------------------------------------------------------//

function setup() {
  createCanvas(CanvasWidth,CanvasHeight);
  frameRate(fr);
  textFont('Times New Roman');
  PushPossiblities();
  
  collideDebug(true);
  //loadingSound

  LoadAllSoundFiles();
  SetAllSoundVolumes(); 
  // console.log(possiblePositionsXFruit);
  // console.log(possiblePositionsYFruit);
  // console.log(possiblePositionsXBomb);
  // console.log(possiblePositionsYBomb);
  
//---------------------------------------------------------------------//
  video = createCapture(VIDEO);
  video.size(width, height);
    // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video,option,modelReady);
  // This sets up an event that fills the global variable "BodyPredictions"
  // with an array every time new BodyPredictions are detected
  poseNet.on("pose", function(results) {
    BodyPredictions = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
  ModelReadyVar = true;
}


function draw() {
  let SoundLoaded = GameSoundLoading();
  let frr = frameRate();
  if (frr<minimumFrameRate&& frr>15){
    minimumFrameRate = frr;
  }
  //console.log(BodyPredictions);
  //console.log(minimumFrameRate);
  frameRate(minimumFrameRate);
  if(frameCount%(fr/3)==0)
    {framerateshow = String(frameRate()).slice(0,3)}
  if(SoundLoaded && ModelReadyVar == true){
    if(life<=0){
    sound_background.stop();  
    Screen = 3;
  }
  if (Screen == 1 ){
    GameStartScreen();
  }
  if (Screen == 2){
  if(Object.keys(BodyPredictions).length != 0){
  prediction = BodyPredictions[0];
  leftWrist = prediction.pose.leftWrist;
  rightWrist = prediction.pose.rightWrist;
    
 // palmBase = prediction.annotations.indexFinger[3];
  }
  
    GameRunningScreen();
  }
  if (Screen == 3){
    GameOverScreen();
  }}
  else{
    LoadingScreen();
  }
 
  
}

function mousePressed() {
  
  if (inScreen1) {
    inScreen1 = false; 
    sound_countdown.play();
    Screen = 2;
   }
  
  if (inScreen3) {
    inScreen3 = false;
    if(!sound_gvs.isPlaying())
    { 
      resetValues();
      sound_countdown.play();
      Screen = 2;
    }
  }

}

function makesquare(){
  push();
  fill(colorofSquare);
  let br = 5*m;
  square(positionXFruit, positionYFruit,SquareSize,br);
  pop();
  poly = [createVector(positionXFruit,positionYFruit),createVector(positionXFruit+SquareSize,positionYFruit),createVector(positionXFruit+SquareSize,positionYFruit+SquareSize),createVector(positionXFruit,positionYFruit+SquareSize)];
  
  positionYFruit = positionYFruit + dy ;
  //If the Fruit/Square Hits the bottom, make it disappear and reappear at the top.
  if(positionYFruit>=height-10*m){
    positionXFruit = random(possiblePositionsXFruit);
    positionYFruit = random(possiblePositionsYFruit);
    life -= 1;
    if(counterForShowingbomb>0){
    counterForShowingbomb -= 1;   
    }
  sound_db.play(); // if the square hits bottom play this sound.
   if(dy<=10*m){
      dy+= 0.2*m ;
    }
  }
}

function GameStartScreen(){
  inScreen1 = true;
  console.log("inStart");
  background(23,10,30);
  push();
  fill(255,150,250);
  noStroke();
  textSize(width/10);
  textAlign(CENTER, CENTER);
  text("FALLING SQUARES",width*0.5,height*0.1); 
  textSize(width/20);
  fill(0,200,0);
  text("Collect all the Squares",width*0.5,height*0.28); 
  textSize(width/25);
  fill(250,0,0);
  text("Don't touch the circles,\nif you do, you will lose life !",width/2,height/2); 
  textSize(width/30);
  fill(25,150,200);
  text("Click to Start the Game",width*0.5,height*0.75); 
  pop();
}

function GameRunningScreen(){
  inScreen2 = true;
  //console.log("Score = "+ score);
  //console.log("life = "+ life);
  
  if(timer == 0){
    timer = -1; 
    sound_background.loop();
   
  }
  if(timer>0){ //Wait for timer to become 0 and then start the game.
   CountDown();   
  }
   else{
  //translate(video.width, 0);
  //scale(-1, 1);
  //image(video, 0, 0, width, height);
  background(23,10,30);
  drawtext("life " +life,width*0.03,width*0.09,height*0.1);
  drawtext("fps " +framerateshow,width*0.03,width*0.5,height*0.1);
  drawtext("Score "+score,width*0.03,width*0.89,height*0.1);
  
  //--------------//
  drawHead();
  //drawSkeleton();
  drawHandCurves();
  //drawKeypoints();
  drawHandWristCircles();
  makesquare();
 
     
  
 
  isFruitCollectedLeft  = collideCirclePoly(leftWrist.x,leftWrist.y, CircleRadius, poly);
  isFruitCollectedRight  = collideCirclePoly(rightWrist.x,rightWrist.y, CircleRadius, poly);
  bombTouchedLeft = collideCircleCircle(leftWrist.x,leftWrist.y,CircleRadius, positionXBomb, positionYBomb,CircleRadius);
  bombTouchedRight = collideCircleCircle(rightWrist.x,rightWrist.y,CircleRadius, positionXBomb, positionYBomb,CircleRadius);
     
     
  //if hits the fruit/score wala jo bhi backsa hai
  if(isFruitCollectedLeft || isFruitCollectedRight){
    sound_bc.play();
    // console.log("Fruit Collected");
    positionXFruit = random(possiblePositionsXFruit);
    positionYFruit = random(possiblePositionsYFruit);
    score += 1;
      if(counterForShowingbomb>0){
    counterForShowingbomb -= 1;   
    }
    
   if(dy<=10*m){
      dy+= 0.2*m ;
    }
  }
  
    if(score>3 && score<= 5){
    colorofSquare = "white";  
    }
    if(score>5 && score<= 7){
    colorofSquare = "yellow";  
    }
    if(score>7 && score<= 10){
    colorofSquare = "green";  
    }
    if(score>10 && score<= 15){
    colorofSquare = "blue";  
    
  }
  
  //if hits the bomb
  if(bombTouchedLeft || bombTouchedRight){
     sound_cc.play();
    console.log("hit bomb");
    life -= 1;
    positionXBomb = random(possiblePositionsXBomb);
    positionYBomb = random(possiblePositionsYBomb);
  }
  else{
    if(life==3){
    colorofCircle = "white";  
    }
    else if(life==2){
    colorofCircle = "orange";  
    }
    else if(life==1){
    colorofCircle = "red";  
    }
  }
}
  if(counterForShowingbomb <= 0){
  push();
  fill(colorofCircle);
  circle(positionXBomb, positionYBomb, 30*m);
  pop();
    
  
  positionYBomb = positionYBomb + dy ;
  
  if(positionYBomb>=height-10*m){
    positionXBomb = random(possiblePositionsXBomb);
    positionYBomb = random(possiblePositionsYBomb);
    }
  }
}

function GameOverScreen(){
  if(life == 0){
    life -=1;
    sound_background.stop();
    sound_gv.play();
    sound_gvs.play();
  }
  inScreen3 = true;
  push();
  background(23,10,30);
  fill(0,0,255);
  noStroke();
  textSize(width/10);
  textAlign(CENTER, CENTER);
  text("GAME OVER ",width/2,height/10); 
  textSize(width*0.08);
  fill(0,200,255);
  text("Score = " + score,width/2,height*0.60); 

  if(!sound_gvs.isPlaying()){

  textSize(width/30);
  fill(0,255,255);
  text("Click to Restart",width*0.5,height*0.75); 

  }
  else{
  
  textSize(width/30);     
  fill(0,255,255);
  text("You Did Great Keep It Up",width*0.5,height*0.75); 

  }
    pop();
}

function GameSoundLoading(){
  if(sound_gv.isLoaded()  && sound_cc.isLoaded() && sound_bc.isLoaded()&& sound_gv.isLoaded && sound_gvs.isLoaded() && sound_db.isLoaded() && sound_countdown.isLoaded() && sound_background.isLoaded()){
    return true;
  }
  else{return false;}
}

function CountDown(){
  console.log("in counter");
  push();
  background(23,10,30);
 
  drawtext(timer,60*m,width/2,height/2);
  pop();
  if (frameCounter % 10 == 0 && timer > 0) { // if the frameCount is divisible by frameRate, then a second has passed. it will stop at 0
    timer --;
  }
  frameCounter ++;
}

function drawtext(text1,size,positionx,positiony){
  push();
  fill(255);
  noStroke();
  textSize(size);
  textAlign(CENTER, CENTER);
  text(text1,positionx,positiony); 
  pop();
  
}

function LoadingScreen(){
  background(23,10,30);
  drawtext("Loading",width*0.07,width/2,height/2);
  
}


function SetAllSoundVolumes(){
  sound_gv.setVolume(0.3);
  sound_cc.setVolume(0.3);
  sound_bc.setVolume(0.3);
  sound_gv.setVolume(0.3);  
  sound_gvs.setVolume(0.3);
  sound_db.setVolume(0.3); 
  sound_countdown.setVolume(0.4);
  sound_background.setVolume(0.1);
}

function LoadAllSoundFiles(){
  soundFormats('mp3', 'ogg','wav');
  sound_countdown = loadSound('Sound_library/countdownbell.wav');
  sound_cc = loadSound('Sound_library/circlecollide.mp3');
  sound_bc = loadSound('Sound_library/boxcollide.mp3');
  sound_gv = loadSound('Sound_library/gameovers.mp3');
  sound_gvs = loadSound('Sound_library/gvsound.mp3');
  sound_db = loadSound('Sound_library/dropbox.mp3');
  sound_background = loadSound('Sound_library/touhou-badappleShort.mp3');
  //sound_background = loadSound('Sound_library/backgroundmusic.mp3');
}


function resetValues(){
dy = 5*m;

positionYFruit = 0 *m ;
positionXFruit = 50 *m ;

positionYBomb = -100*m  ;
positionXBomb = 50*m  ;

counterForShowingbomb = 3 ;

poly = [];

colorofSquare ="white";
colorofCircle ="white";

score = 0 ;
life = 3 ;

timer = 3;
}

function PushPossiblities(){
   for(let i = (10*m) ; i<(width-(SquareSize+10)) ;  i += SquareSize*2){
   possiblePositionsXFruit.push(i);
  }
   for(let i = (SquareSize+10) ; i<(width-(SquareSize+10)) ;  i += SquareSize*2){
   possiblePositionsXBomb.push(i);
  }
  for(let j = (35*m) ; j<(height/2) ;  j += (70*m)){
    possiblePositionsYFruit.push(-j);
  }
   for(let j = 0 ; j<(height/2) ;  j += (70*m)){
   possiblePositionsYBomb.push(-(j+15));
  }
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the BodyPredictions detected
  for (let i = 0; i < BodyPredictions.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = BodyPredictions[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < BodyPredictions.length; i += 1) {
    const skeleton = BodyPredictions[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}


function drawHandCurves(){
  for (let i = 0; i < BodyPredictions.length; i += 1){
  const pose = BodyPredictions[0].pose;
  const Nose = {
    x:pose.nose.x,
    y:pose.nose.y
  };
    const leftEye = {
    x:pose.leftEye.x,
    y:pose.leftEye.y
  };
    const leftShoulder = {
    x:pose.leftShoulder.x,
    y:pose.leftShoulder.y
  };
  const rightShoulder = {
    x:pose.rightShoulder.x,
    y:pose.rightShoulder.y
  };
    const leftElbow = {
    x:pose.leftElbow.x,
    y:pose.leftElbow.y
  };
    const rightElbow = {
    x:pose.rightElbow.x,
    y:pose.rightElbow.y
  };  
    const leftWrist = {
    x:pose.leftWrist.x,
    y:pose.leftWrist.y
  };
  const rightWrist = {
    x:pose.rightWrist.x,
    y:pose.rightWrist.y
  };
  const leftHip ={
    x:pose.leftHip.x,
    y:pose.leftHip.y
  };
  const rightHip ={
    x:pose.rightHip.x,
    y:pose.rightHip.y
  };
  const leftKnee = {
    x:pose.leftKnee.x,
    y:pose.leftKnee.y
  };
  const rightKnee = {
    x:pose.rightKnee.x,
    y:pose.rightKnee.y
  };
  const leftAnkle = {
    x:pose.leftAnkle.x,
    y:pose.leftAnkle.y
  };
  const rightAnkle = {
    x:pose.rightAnkle.x,
    y:pose.rightAnkle.y
  };
push();
fill(255,255,255);
    
//-----------------------------------------hand Curves---------------------------------------//
curve(width,height,leftShoulder.x,leftShoulder.y,leftElbow.x,leftElbow.y,width,height/2);
curve(0,height/2,rightShoulder.x,rightShoulder.y,rightElbow.x,rightElbow.y,0,height);
curve(width,height,leftElbow.x,leftElbow.y,leftWrist.x,leftWrist.y,width,height/2);
curve(0,height/2,rightElbow.x,rightElbow.y,rightWrist.x,rightWrist.y,0,height); 
    
//-----------------------------------------foot Curves---------------------------------------//
    
curve(width,height,leftHip.x,leftHip.y,leftKnee.x,leftKnee.y,width,height/2);
curve(0,height/2,rightHip.x,rightHip.y,rightKnee.x,rightKnee.y,0,height);
curve(width,height,leftKnee.x,leftKnee.y,leftAnkle.x,leftAnkle.y,width,height/2);
curve(0,height/2,rightKnee.x,rightKnee.y,rightAnkle.x,rightAnkle.y,0,height); 
//------------------------------Upper Abdomen--------------------------------------//
   /* 
let UAbdomen = {x: (leftShoulder.x + rightShoulder.x)/2 , y :(leftShoulder.y+leftHip.y)/3};
push();
noStroke();
fill(255,255,255);
circle(UAbdomen.x,UAbdomen.y,dist(Nose.x,Nose.y,leftEye.x,leftEye.y));
pop();
//-----------------------------Lower Abdomen-------------------------------//   */
let LAbdomen = {x: (leftShoulder.x + rightShoulder.x)/2 , y :(leftShoulder.y+leftHip.y)/2};
push();
noStroke();
fill(255,0,255);
ellipse(LAbdomen.x,LAbdomen.y,dist(leftShoulder.x,leftShoulder.y,rightShoulder.x,rightShoulder.y),dist(leftHip.x,leftHip.y,leftShoulder.x,leftShoulder.y));
pop();
    
    
  }
}

function drawHead(){
  for (let i = 0; i < BodyPredictions.length; i += 1){
  const pose = BodyPredictions[i].pose;
  const Nose = {
   x:pose.nose.x , 
   y:pose.nose.y 
  };
  const leftEye = {
    x:pose.leftEye.x , 
    y:pose.leftEye.y
  };
  push();
    noStroke();
    fill(255,255,0);
    circle(Nose.x,Nose.y,dist(Nose.x,Nose.y,leftEye.x,leftEye.y)*5);  
  pop();
  }
  
}

function drawHandWristCircles(){
  for(let i = 0; i<BodyPredictions.length; i+=1){
    const pose = BodyPredictions[i].pose;
    const leftWrist = {
      x:pose.leftWrist.x,
      y:pose.leftWrist.y
    };
    const rightWrist = {
      x:pose.rightWrist.x,
      y:pose.rightWrist.y
    };
    push();
    fill(107,102,102);
    circle(leftWrist.x,leftWrist.y,CircleRadius);
    circle(rightWrist.x,rightWrist.y,CircleRadius);
    pop();
    
  }
}

