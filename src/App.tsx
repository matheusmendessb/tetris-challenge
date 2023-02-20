import './App.css';
import { useState, useEffect, useLayoutEffect } from "react";

interface ICurrentShape {
  shape: number[][],
  color: string,
  location: number[],
  indexes: number[]
}

function App() {
  let [currentShape] = useState<ICurrentShape>();
  const [height] = useState<number>(15);
  const [width] = useState<number>(10);
  let [state] = useState<string | number>(1);
  const [colors] = useState<string[]>(['black', 'orange', 'red', 'blue']);
  let [occupiedblocks] = useState<number[]>([]);
  let [direction] = useState<string>("");
  let [points] = useState<any>(0);
  let [timer] = useState<ReturnType<typeof setTimeout>>();

  function createBoard() {

    var board = document.getElementsByClassName('tetris-board')[0];
    board.innerHTML = '';
    var counter = 0;

    for (var y = 0; y < height; y++) {
      var row: any = document.createElement('div');
      row.className = 'row';
      row.dataset.row = y;
  
      for (var x = 0; x < width; x++) {
        var block: any = document.createElement('div');
        block.className = 'block';
        block.dataset.x = x;
        block.dataset.y = y;
        block.dataset.index = counter;
        block.dataset.state = 0;
        row.appendChild(block);
        counter++;
      }
  
      board.appendChild(row);
    }
  }

  // gets generated on start and when shape has completed its course
  function createShape() {
    const shapes = [[[1, 0], [0,1], [1,1],[2,1]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [0, 1], [1, 0], [1, 1]], [[2,0], [0, 1], [1, 1], [2,1]]];
    var randomShape = Math.floor(Math.random() * shapes.length);
    var randomColor = Math.floor(Math.random() * colors.length);
    var center = Math.floor(width / 2);
    var shape = shapes[randomShape];
    var location = [center, 0];

	  currentShape = {
      shape: shape,
      color: colors[randomColor],
      location: location,
      indexes: getBlockNumbers(shape, location)
	  };

    if (isCollision()) {
      state = "2"; // game over
      document.getElementById('points')!.innerHTML += ' Game over';
      clearInterval(timer);
    }
  }

  function getBlockNumbers(shape: number[][], location: number[]) {
	  var numbers = new Array();

	  for(var i = 0; i < shape.length; i++) {
		  var x = shape[i][0] + location[0];
		  var y = shape[i][1] + location[1];

		  var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');
		  numbers.push(block.dataset.index);
	  }

	  return numbers;
  }

  function drawShape() {

	  collided();

	  // draw the current shape onto board
    var shape = currentShape!.shape;
    var location = currentShape!.location;

	  clearCurrent();

    if (direction==="down")
      currentShape!.location[1]++;
    else if(direction==="left")
      currentShape!.location[0]--;
    else if (direction==="right")
      currentShape!.location[0]++;
	
	  for(var i = 0; i < shape.length; i++) {
      var x = shape[i][0] + location[0];
      var y = shape[i][1] + location[1];
      var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');
      block.classList.add('filled');
      block.style.backgroundColor = currentShape!.color;
	  }

	  currentShape!.indexes = getBlockNumbers(currentShape!.shape, currentShape!.location);
  }

  function clearCurrent() {
    // reset all blocks
    var shape = currentShape!.shape;
    var location = currentShape!.location;
	
	  for(var i = 0; i < shape.length; i++) {
      var x = shape[i][0] + location[0];
      var y = shape[i][1] + location[1];
      var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');
      block.classList.remove('filled');
      block.style.backgroundColor="";
	  }
  }

  function collided() {
    var blocks = currentShape!.shape;
    var offset = currentShape!.location;
    var collision = false;

	  for(var i = 0; i < blocks.length; i++) {

      var block: any = blocks[i];
      var x = block[0] + offset[0];
      var y = block[1] + offset[1];

		  if (direction ==="down")
			  y++;

		  var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');

		  if (y === height || occupiedblocks.indexOf(block.dataset.index) > -1) {
        collision = true;
        break;
		  }
	  }

	  if (collision) {
		  for(var i = 0; i < blocks.length; i++) {

        var block: any = blocks[i];
        var x = block[0] + offset[0];
        var y = block[1] + offset[1];

        var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');
        block.dataset.state = "1";
		  }

      occupiedblocks = occupiedblocks.concat(currentShape!.indexes);
      createShape();
      checkRows();
	  }

	  return collision;
  }

  function isCollision() {
    var blocks = currentShape!.shape;
    var offset = currentShape!.location;
    var collision = false;

	  for(var i = 0; i < blocks.length; i++) {
      var block: any = blocks[i];
      var x = block[0] + offset[0];
      var y = block[1] + offset[1];

      if (direction === "down")
        y++;

		  var block: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');

		  if (y === height || occupiedblocks.indexOf(block.dataset.index) > -1) {
        collision = true;
        break;
		  }
	  }

	  return collision;
  }

  function checkKey(e: any) {
    e.preventDefault();
  
    if (e.keyCode == '40') {
      // down arrow
      direction = "down";
    }
    else if (e.keyCode == "38")
    {
      direction = "rotation";
      rotate();
    }
    else if (e.keyCode == '37') {
      // left arrow
      direction = "left";
    }
    else if (e.keyCode == '39') {
      // right arrow
      direction = "right";
    }
  
    if (hitTheWall() === false)
      drawShape();
  }

  // roates current shape
  function rotate() {
	  var newShape = new Array();
	  var shape = currentShape!.shape;

	  for(var i = 0; i < shape.length; i++) {
      var x = shape[i][0];
      var y = shape[i][1];
      var newx = (getWidth() - y);
      var newy = x;
      newShape.push([newx, newy]);
	  }

    clearCurrent();

    currentShape!.shape = newShape;
    currentShape!.indexes = getBlockNumbers(newShape, currentShape!.location);
  }

  function getWidth() {
	  var width = 0;

	  for(var i = 0; i < currentShape!.shape.length; i++) {
	    var block = currentShape!.shape[i];
		  if (block[0] > width)
			  width = block[0];
	  }

	  return width;
  }

  function hitTheWall() {
    // check if the current block at at the edge already
    // if any block in shape has an x index of 0 or width - 1
    // or if any element to the left of right is occupied
    var blocks = currentShape!.shape;
    var offset = currentShape!.location;
    var collision = false;

	  for(var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var x = block[0] + offset[0];
      var y = block[1] + offset[1];

		  if (direction === "left")
			  x--;
		  else if (direction === "right")
			  x++;

		  var blk: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');

		  if (occupiedblocks.indexOf(blk.dataset.index) > -1) {
        collision=true;
        break;
		  }

		  if (x < 0 && direction === "left") {
        collision=true;
        break;
		  }

		  else if (x === width && direction === "right") {
        collision=true;
        break;
		  }
	  }

	  return collision;
  }

  function checkRows() {
    var counter = 0;
    var start = 0;

    // check all rows for complete lines
    // after collision
	  for (var y = 0; y < height; y++) {
      var filled = true;
      for(var x = 0; x < width; x++) {
        var blk: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');
        if (blk.dataset.state === "0") {
          filled=false;
          break;
			  }
		  }

		  if (filled) {
        if (start === 0)
          start = y;

			  counter++;

			  // clear out line
			  for(var i = 0; i < width;i++) {
          var blk: any = document.querySelector('[data-x="' + i + '"][data-y="' + y + '"]');
          blk.dataset.state = "0";
          blk.style.backgroundColor = "white";
          removeIndex(blk.dataset.index);
			  }
		  }
	  }

	  if (counter > 0) {
      points += counter * 100;
      shiftDown(counter, start);
      document.getElementById("points")!.innerHTML = points;
	  }
  }

  // shift down all occupied blocks from top to down
  // update all 'y' coordinates + 1, ending with row we're removing
  function shiftDown(counter: number, start: number) {
	  for (var i = start-1; i >= 0; i--) {
		  for(var x = 0; x < width; x++) {
			  var y = i + counter;
			  var blk: any = document.querySelector('[data-x="' + x + '"][data-y="' + i + '"]');
			  var nextblock: any = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]');

			  if (blk.dataset.state == "1") {
          nextblock.style.backgroundColor = blk.style.backgroundColor;
          nextblock.dataset.state = "1";
          blk.style.backgroundColor ="white";
          blk.dataset.state = "0";
          removeIndex(blk.dataset.index);
          occupiedblocks.push(nextblock.dataset.index);
			  }
		  }
	  }
  }

  function removeIndex(index: number) {
	  var location = occupiedblocks.indexOf(index);
	  occupiedblocks.splice(location, 1);
  }

  function start() {
    createBoard();
    createShape();
    drawShape();

    document.addEventListener('keydown', checkKey);
  }

  function startTimer() {
    state = 1;
    occupiedblocks = new Array();
    createBoard();
    createShape();
    drawShape();
	
    timer = setInterval(function() {
      direction = "down";
      drawShape();
    }, 800);
  }

  useEffect(() => {
    start();
  }, []);

  return (
    <div className="App">
      
      <div className="points" id="points">0</div>
		  <div className="tetris-board"></div>
		  <a href="#" onClick={startTimer}>Start</a>
    </div>
  );
}

export default App;
