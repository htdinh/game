/*Orignal: http://thecodeplayer.com/walkthrough/html5-game-tutorial-make-a-snake-game-using-html5-canvas-jquery
Personal Contribution/modification:
1) Handle the hit the wall scenario. 
2) Ensure food created doesn't collide with the snake body
3) Draw the grid line and canvas border 
4) Clear score on the grid, otherwise the score my obscures the snake movement if food falls into the score corner.
5) Fix the time lag when score add beyond 9 
6) Position it into the middle area
7) Alert game over. With score and pause. Resume by mouseclick
8) Add status (Play, Pause, Resume) to game by revamping the functions to modules. 
9) Add control button set to control from mobile device (without keyboards)
10) Add keyboard-friendly space-bar button. This is more natural than controlling movement 
	by keyboards but resume failed games by using mouse to click restart.
*/

//Canvas stuff
var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width();
var h = $("#canvas").height();
var context = canvas.getContext("2d");
//Lets save the cell width in a variable for easy control
var cw = 20;
var d;
var food;
var score = 0;
var game_status = "reset"; 
var pause = false;
//Lets create the snake now
var snake_array; //an array of cells to make up the snake
var blinking = "blue";

function init()
{		
	console.log("Init");
	d = "right"; //default direction
	create_snake();
	create_food(); //Now we can see the food particle
	score = 0;
	paint();
}

function create_snake()
{
	var length = 5; //Length of the snake
	snake_array = []; //Empty array to start with
	for(var i = length-1; i>=0; i--)
	{
		//This will create a horizontal snake starting from the top left
		snake_array.push({x: i, y:0});
	}
}

//Lets create the food now
function create_food()
{
	do {
	food = {
		x: Math.round(Math.random()*(w-cw)/cw), 
		y: Math.round(Math.random()*(h-cw)/cw), 
	};
	}
	while(check_collision(food.x, food.y, snake_array));
	//This will create a cell with x/y between 0-44
	//Because there are 45(450/10) positions accross the rows and columns
}

//The movement code for the snake to come here.
//The logic is simple
//Pop out the tail cell and place it in front of the head cell
function move()
{
	var nx = snake_array[0].x;
	var ny = snake_array[0].y;
	//These were the position of the head cell.
	//We will increment it to get the new head position
	//Lets add proper direction based movement now
	//nx and ny stand for next x and next y

	if(d == "right") nx++;
	else if(d == "left") nx--;
	else if(d == "up") ny--;
	else if(d == "down") ny++;
	console.log(nx.toString()+":"+ny.toString());
	var tail = {x:nx,y:ny};
	if (nx>=0) {
			tail.x = nx%(w/cw); 
		}
		else {
			tail.x = w/cw+nx%(w/cw); 
		}
	if (ny>=0) {
			tail.y = ny%(h/cw);
		}
		else {
			tail.y = h/cw+ny%(h/cw); 
		}
	//Lets add the game over clauses now
	//This will restart the game if the snake hits the wall
	//Lets add the code for body collision
	//Now if the head of the snake bumps into its body, the game will restart		
	if(check_collision(nx, ny, snake_array))
	{		
		game_status = "lose";
		clearInterval(game_loop);
		document.getElementById("idButton").value = "Reset";
		alert("Game over!");
	}
	snake_array.unshift(tail);
	
	//Lets write the code to make the snake eat the food
	//The logic is simple
	//If the new head position matches with that of the food,
	//Create a new head instead of moving the tail
	nx = tail.x;
	ny = tail.y;
	if(nx == food.x && ny == food.y)	
	{
		var tail = {x: nx, y: ny};
		score++;
		//Create new food
		create_food();
		snake_array.push(tail);
	}
	else
	{
	snake_array.pop();
	}
	paint();
}

//Lets paint the snake now
function paint()
{	
	//To avoid the snake trail we need to paint the BG on every frame
	//Lets paint the canvas now
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);
		
	//paint the snake
	for(var i = 0; i < snake_array.length; i++)
	{
		if (i==0) var color = "red";
		else var color = "green";
		var c = snake_array[i];
		//Lets paint 10px wide cells
		paint_cell(c.x, c.y, color);
	}
	//Draw grid
	for (var x = 0; x < w; x += cw) {
	  ctx.moveTo(x, 0);
	  ctx.lineTo(x, h);
	}
	for (var y = 0; y < h; y += cw) {
	  ctx.moveTo(0, y);
	  ctx.lineTo(w, y);
	}
	//ctx.lineWidth=10;
	ctx.strokeStyle = "#ddd";
	ctx.stroke();
	
	//Lets paint the food and draw score
	if (blinking == "blue")
	{
	paint_cell(food.x, food.y,blinking);		
	blinking = "orange";
	}
	else
	{
	paint_cell(food.x, food.y,blinking);		
	blinking = "blue";
	}	
	draw_score();
}

function draw_score()
{
	document.getElementById("idScore").innerHTML = score.toString();		
}
//Lets first create a generic function to paint cells
function paint_cell(x, y, color)
{
	ctx.fillStyle = color;
	ctx.fillRect(x*cw, y*cw, cw, cw);
	ctx.strokeStyle = "white";
	ctx.strokeRect(x*cw, y*cw, cw, cw);
}

function check_collision(x, y, array)
{
	//This function will check if the provided x/y coordinates exist
	//in an array of cells or not
	for(var i = 0; i < array.length; i++)
	{
		if(array[i].x == x && array[i].y == y)
		 return true;
	}
	return false;
}

//Lets add the keyboard controls now
$(document).keydown(function(e){
	var key = e.which;
	//We will add another clause to prevent reverse gear
	key_decode(key);
})	

function key_decode(key)
{
		if(key == "37") //LEFT
		{
			if(d != "right") d = "left";		
			if (game_status == "rest") {play_game()};
		}
		else if(key == "38") 
		{	
			if (d != "down") d = "up";
			if (game_status == "rest") {play_game()};
		}
		else if(key == "39")
		{
			if(d != "left") d = "right";
			if (game_status == "rest") {play_game()};
		}
		else if(key == "40")
		{
			if(d != "up") d = "down";
			if (game_status == "rest") {play_game()};
		}
		else if(key == "32") {play_game()}; 
		//The snake is now keyboard controllable
}
function button_ctrl(key2)
{
	key_decode(key2);
}
function play_game() 
{	
	switch (game_status){
	case "reset":
	{
		run_move();
		game_status = "play";
		document.getElementById("idButton").value = "Pause";
		break;
	}
	case "play":
	{
		clearInterval(game_loop);
		game_status = "rest";
		document.getElementById("idButton").value = "Resume";
		break;
	}
	case "rest": //resumes from "Rest" to "Play" status 
	{	
		run_move();
		game_status = "play";
		document.getElementById("idButton").value = "Pause";
		break;
	}
	case "lose":
	{
		document.getElementById("idButton").value = "Play";
		init(); //reset the game
		game_status = "reset";
		break;
	}
	}
}

function run_move()
{
if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(move, 200);	
}
window.onload = function()
 {				
	init();
	pause = true;
	game_status = "reset"
 };	
