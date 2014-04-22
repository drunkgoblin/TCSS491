// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    console.log(path.toString());
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
    if (this.downloadQueue.length === 0) window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function(path){
    //console.log(path.toString());
    return this.cache[path];
}


function FoodEnemy(game, x, y, width, height) {
    this.width = width;
    this.height = height;
    
    Entity.call(this, game, x, y);
}

FoodEnemy.prototype.constructor = FoodEnemy;

FoodEnemy.prototype.update = function () {
    this.x -= 400 * this.game.clockTick;
    if (this.x + this.width < 0) this.x += 3200;   
    Entity.prototype.update.call(this);
}

FoodEnemy.prototype.draw = function (ctx) {
    
    console.log('draw watermelon');
    
   
    
}


function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    //this.timer = new Timer();
    this.startInput();

    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left - 20;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top - 20;

        x = Math.floor(x / 40);
        y = Math.floor(y / 30);
 
        if (x < 0 || x > 18 || y < 0 || y > 18) return null;

        return { x: x, y: y };
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
}



function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    //var size = Math.max(image.width, image.height);
    offscreenCanvas.width = 800;
    offscreenCanvas.height = 800;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

function FatCats(game, foods) {
    this.foods = foods;
	this.weight = 99;
    Entity.call(this, game, 0, 400);
}

FatCats.prototype = new Entity();
FatCats.prototype.constructor = FatCats;

FatCats.prototype.update = function () {
    Entity.prototype.update.call(this);
}

FatCats.prototype.draw = function (ctx) {

    //ctx.drawImage(ASSET_MANAGER.getAsset("./Images/watermelon.png"), GameBoard.path[this.count].x * 40, GameBoard.path[this.count].y * 30,100,100);//420, 0, 100, 100);
}

// GameBoard code below

function GameBoard(game) {
    Entity.call(this, game, 20, 20);
	this.loss = false;
	this.timer = new Timer();
	this.oldTimer = 0;
	this.money = 0;
	this.count = 0;
	this.last = 0;
    this.grid = false;
    this.black = true;//LEFT
	this.board = [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		    	  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			      [ 0, 0,42,42,42,42,42,42,42,42,42,42,42,42,42, 0, 0, 0, 0, 0],//bottom
	/*top*/	      [ 0, 0,42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0],
				  [ 0, 0,42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0],
				  [42,42,42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,42,42,42,42,42, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
				  
	this.path = [{x:10, y:0},{x:10, y:1},{x:10, y:2},{x:9, y:2},{x:8, y:2},
	    {x:7, y:2},{x:7, y:3},{x:7, y:4},{x:7, y:5},{x:7, y:6},{x:7, y:7},
		{x:7, y:8},{x:7, y:9},{x:7, y:10},{x:7, y:11},{x:7, y:12},
		{x:7, y:13},{x:7, y:14},{x:8, y:14},{x:9, y:14},{x:10, y:14},
		{x:11, y:14},{x:12, y:14},{x:13, y:14},{x:13, y:15},
		{x:13, y:16},{x:13, y:17},{x:13, y:18}];
						//RIGHT
GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;
}
GameBoard.prototype.cloneBoard = function () {
    var b = [];
    for (var i = 0; i < 19; i++) {
        b.push([]);
        for (var j = 0; j < 19; j++) {
            b[i].push(this.board[i][j]);	
        }
    }
    return b;
}

GameBoard.prototype.update = function () {
	this.timer.tick();
	if ((this.timer.gameTime - this.oldTimer) > 1) {
		if (this.count < 27) {
			this.count++;
		}
		this.oldTimer = this.timer.gameTime;
	}
	

	if (FatCats.weight > 99 || FatCats.weight < 30) {
		this.loss = true;
	}
	if (this.count > 26 ) {
		this.loss = true;
		//FatCats.weight++;
		//FatCats.count = 27;
	}
    if (this.game.click) {
        var x = this.game.click.x;
        var y = this.game.click.y;
        if (this.board[x][y] === 0) {
            var color = this.black ? 1 : 2;
            var oldState = this.cloneBoard();
            this.board[x][y] = color;
            this.black = !this.black;

            var that = this;
            function checkCapture(dir) {
                if (that.board[dir.x][dir.y] === 0) return;
                if (that.board[dir.x][dir.y] === color) return;
                //check for capture
                var grp = [];
                var libs = [];
                that.countLiberties(dir.x, dir.y, grp, libs);
                if (libs.length === 0) {
                    for (var i = 0; i < grp.length; i++) {
                        that.board[grp[i].x][grp[i].y] = 0;
                    }
                }
            }

/*             if (x - 1 >= 0) {
                checkCapture({ x: x - 1, y: y });
            }
            if (y - 1 >= 0) {
                checkCapture({ x: x, y: y - 1 });
            }
            if (x + 1 <= 18) {
                checkCapture({ x: x + 1, y: y });
            }
            if (y + 1 <= 18) {
                checkCapture({ x: x, y: y + 1 });
            } */

            var l = [];
            this.countLiberties(x, y, [], l);
            if (l.length === 0) {
                this.board = oldState;
                this.black = !this.black;
            }
        }
    }
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./Images/Carrico_Town_1_A.png"), 0, 0, 800, 600);
	ctx.drawImage(ASSET_MANAGER.getAsset("./Images/FatCat.png"), 520, 510, 100, 100);
	ctx.fillStyle = "Red";
	ctx.fillText(this.timer.gameTime,10,10)
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            if (this.grid) {
                ctx.strokeStyle = "green";
                ctx.strokeRect(/* 20 + */ i * 40, /* 20 + */ j * 30, 40, 30); 
				
            }
			if (this.board[i][j] === 42) {
				ctx.drawImage(ASSET_MANAGER.getAsset("./Images/path.png"), (i * 40) +40 -5, (j * 30) +30 -3.75, 10, 7.5);
			}
            if (this.board[i][j] === 1 || this.board[i][j] === 2) {
                //dog tower
                ctx.drawImage(ASSET_MANAGER.getAsset("./Images/dog.gif"), i * 40 + 20, j * 30 + 20, 40, 30);
            }

           
/*             else if (this.board[i][j] === 2) {
                //white stone
                ctx.drawImage(ASSET_MANAGER.getAsset("./img/white.png"), i * 39.55 + 23.5, j * 39.55 + 23.5, 39.55, 39.55);
            } */
       }
    }
	ctx.drawImage(ASSET_MANAGER.getAsset("./Images/watermelon.png"), this.path[this.count].x * 40 + 30, this.path[this.count].y * 30,100,100);
	if (this.loss) {
	    ctx.fillStyle = "Red";
	    ctx.font = "bold 60px sans-serif";
	    ctx.fillText("YOU LOSE!!",230,320);
	}
	//move image
/* 	if (this.count >= (this.path.length -1)) {
		this.count = 0;
	}
	ctx.drawImage(ASSET_MANAGER.getAsset("./Images/path.png"), (this.path[this.count].x * 40) +40 -5, (this.path[this.count].y * 30) +30 -3.75, 10, 7.5);
	Timer.prototype.tick();
	if (Timer.gameTime > this.last) {
		this.count++;
		this.last = Timer.gameTime;
	} */
	
    // draw mouse shadow
    if (this.game.mouse && this.board[this.game.mouse.x][this.game.mouse.y] === 0) {
        var mouse = this.game.mouse;
        ctx.save();
        ctx.globalAlpha = 0.5;
        //if (this.black) {
            ctx.drawImage(ASSET_MANAGER.getAsset("./Images/dog.gif"), mouse.x * 40 + 20, mouse.y * 30 + 20, 40, 30);
        //}  else {
           // ctx.drawImage(ASSET_MANAGER.getAsset("./img/white.png"), mouse.x * 39.55 + 23.5, mouse.y * 39.55 + 23.5, 39.55, 39.55);
        //} 
        ctx.restore();
    }
}

GameBoard.prototype.countLiberties = function (x, y, grp, libs) {
    var color = this.board[x][y];
    if (color === 0) return;
    grp.push({ x: x, y: y });
    var that = this;

    function contains(lst, itm) {
        for (var i = 0; i < lst.length; i++) {
            if (lst[i].x === itm.x && lst[i].y === itm.y) return true;
        }
        return false;
    }

    function checkStone(dir) {
        var stone = that.board[dir.x][dir.y];
        if (stone === 0) {
            if (!contains(libs,{ x: dir.x , y: dir.y })) {
                libs.push({ x: dir.x, y: dir.y });
            }
        } else if (stone === color) {
            if (!contains(grp,{ x: dir.x, y: dir.y })) {
                that.countLiberties(dir.x, dir.y, grp, libs);
            }
        }
    }
    // four directions
    // west
    if (x - 1 >= 0) {
        checkStone({ x: x - 1, y: y });
    }
    // north
    if (y - 1 >= 0) {
        checkStone({ x: x, y: y - 1 });
    }
    // east
    if (x + 1 <= 18) {
        checkStone({ x: x + 1, y: y });
    }
    // south
    if (y + 1 <= 18) {
        checkStone({ x: x, y: y + 1 });
    }
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./Images/Carrico_Town_1_A.png");
ASSET_MANAGER.queueDownload("./Images/FatCat.png");
ASSET_MANAGER.queueDownload("./Images/dog.gif");
ASSET_MANAGER.queueDownload("./Images/path.png");
ASSET_MANAGER.queueDownload("./Images/watermelon.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var food = [];

    var f = new FoodEnemy(gameEngine, 420, 0, 100, 100);
    gameEngine.addEntity(f);
    food.push(f);
  
    var fatcat = new FatCats(gameEngine, food);
   
    var gameboard = new GameBoard(gameEngine);
    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(fatcat);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
