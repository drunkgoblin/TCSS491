// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011


//global debug variable - set to true to see console.log output.

var is_debug = false;
var USERNAME = 'Guest';
var POINTS = 0;


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

function ajaxs() {
    this.p;
this.doc;
}

ajaxs.prototype.validateForm = function() {
    this.doc=document.getElementById('login').value;
    if (this.doc===null || this.doc==="")
    {
        alert("Please fill out the username");
        return false;
    } else {
USERNAME = this.doc;
        this.my_ajax_post("user_name="+this.doc,"mysqlsel.php", this.my_ajax_callback, true);
}
}

ajaxs.prototype.my_ajax_post = function(data, url, callback, mode) {
    AJAX = window.XMLHttpRequest ? new XMLHttpRequest() : window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : null;
    AJAX.onreadystatechange = callback;
    AJAX.open ("post", url, mode);
    AJAX.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    AJAX.send (data);
}

ajaxs.prototype.my_ajax_callback = function() {
    if (AJAX.readyState == 4){
        if (AJAX.status == 200) {
            this.p = AJAX.responseText;
if (this.p||!this.p) {
var insQuery = "INSERT INTO users VALUES ("+this.doc+","+POINTS+");";
if (this.p === "false") {
repost();
} else {
                    POINTS += parseInt(this.p);
}
}
        }
    }
}

function repost() {
    ajaxs.prototype.my_ajax_post("user_name="+USERNAME+"&points="+POINTS,"mysqlins.php",null,true);
}

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {

    if (is_debug) {
        console.log(path.toString());
    }
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length === this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
  
    if (this.downloadQueue.length === 0) {
        window.setTimeout(callback, 100);
    }

    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            if (is_debug) {
                console.log("dun: " + this.src.toString());
            }
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
    return this.cache[path];
}

function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.stage = new Kinetic.Stage({
        container: "gamey",
        width: 800,
        height: 600,
        transformsEnabled: 'none'
        
    });

    this.stage.on('click', function () {
        console.log('click');
    });

    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 27) {
            console.log('escape keydown');
        }

    });

    window.addEventListener('keyup', function (e) {
        if (e.keyCode === 27) {
            console.log('escape keyup');
        }
    });

    this.baseLayer = new Kinetic.Layer({
        hitgraphEnabled: false,
        transformEnabled: 'none'
        
    });
    this.foodLayer = new Kinetic.FastLayer({
      listening: true
    });

    this.scoreBoard = new Kinetic.Layer({
        listening: true
    });

    
    this.stage.add(this.baseLayer);
    this.stage.add(this.foodLayer);
    this.stage.add(this.scoreBoard);
    this.gameboard = new GameBoard(this);
    this.towerholder = new TowerHolder(this);
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.oldTime = 0;
    this.startInput();

    if (is_debug) {
        console.log('game initialized');
    }
}

GameEngine.prototype.start = function () {

    if (is_debug) {
        console.log("starting game");
    }

    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {

    if (is_debug) {
        console.log('Starting input');
    }

    var getXandY = function (e) {
        var x = e.clientX;
        var y = e.clientY;
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

    if (is_debug) {
        console.log('Input started');
    }
}

GameEngine.prototype.addEntity = function (entity) {

    if (is_debug) {
        console.log('added entity');
    }

    this.entities.push(entity);
}

GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
         var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            this.entities[i].draw(this.ctx);
        }
    }

    if (drawCallback) {
        drawCallback(this);
    }

    this.ctx.restore();
    
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;
this.oldTime = this.timer.gameTime;
    this.timer.tick();
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (i = this.entities.length - 1; i >= 0; --i) {
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

function FoodEnemy(game, width, height, path, diff, start, image, foodtype) {
    this.game = game;
    this.start = start;
    this.width = width;
    this.height = height;
    this.calories = 5;
    this.lastTime = 0;
    this.speed = 20.0 + diff;
    this.path = path;//[{x:0, y:300},{x:200, y:300},{x:200, y:100},{x:400, y:100},{x:400, y:300},{x:799, y:300}];
    this.startX = this.path[0].x;
    this.startY = this.path[0].y;
    this.x = this.path[0].x;
    this.y = this.path[0].y;
    this.current = 0;
    this.layer = game.foodLayer;
    this.drawimage = true;
    this.imagepath = image;
    this.boundingcircle = new BoundingCircle(this.x + (this.width/2), this.y + (this.height/2), 10);
    this.removeFromWorld = false;
    this.goodfood = foodtype;
    
    Entity.call(this, game, this.x, this.y);
}

FoodEnemy.prototype = new Entity();
FoodEnemy.prototype.constructor = FoodEnemy;

FoodEnemy.prototype.update = function () {
      
    if (!this.game.gameboard.loss && !this.game.gameboard.win) {
        if ((this.game.timer.gameTime - this.lastTime) > 0.05) {
            this.lastTime = this.game.timer.gameTime;
            if (this.lastTime > this.start) {
this.boundingcircle.x = this.x;
this.boundingcircle.y = this.y;
                if (this.x > (this.path[this.current].x + this.speed) || this.x < (this.path[this.current].x - this.speed)) {
                    if (this.x < this.path[this.current].x) {
                        this.x += this.speed;
                    } else {
                        this.x -= this.speed;
                    }
                } else if (this.y > this.path[this.current].y + this.speed || this.y < this.path[this.current].y - this.speed) {
                    if (this.y < this.path[this.current].y) {
                        this.y += this.speed;
                    } else {
                        this.y -= this.speed;
                    }
                } else {
                    this.x = this.path[this.current].x;
                    this.y = this.path[this.current].y;
                    if (this.current < (this.path.length - 1)) {
                        this.current++;
                    } else {
                        this.game.gameboard.fatcat.weight += this.calories;
                        this.game.gameboard.finished++;
                        this.removeFromWorld = true;
                        this.image.remove(this.image);
                    }
                }
            }
        }
    }
   
    Entity.prototype.update.call(this);
    
}

FoodEnemy.prototype.draw = function (ctx) {

    if ((this.startX != this.x) ||
        (this.startY != this.y)) {
        if (this.drawimage) {
            this.image = new Kinetic.Image({
                image: this.imagepath,
                draggable: false,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            });

            //var text = "Bad";

            //if (this.goodfood) {
            // text = "Good";
            //}

            //this.goodfood = new Kinetic.Text({
            // x: this.x + 25,
            // y: this.y,
            // text: text,
            // fontSize: 16,
            // fontFamily: 'sans-serif',
            // fill: "black"
            // });

            this.image.startX = this.x;
            this.image.startY = this.y;
            this.drawimage = false;
            this.layer.add(this.image);
           // this.layer.add(this.goodfood);

        } else {
            this.image.x(this.x);
            this.image.y(this.y);
            //this.goodfood.x(this.x);
            //this.goodfood.y(this.y);
        }

        if (!this.removeFromWorld) {
            this.layer.draw(this.image);
            //this.layer.draw(this.goodfood);
            
        }
    }
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
}

Entity.prototype.cleanup = function (ctx) {
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 800;
    offscreenCanvas.height = 600;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}

function FatCats(game, foods) {
    this.lastTime = 0;
    this.foods = foods;
    this.weight = 60;
    this.scoreBoard = game.scoreBoard;
    this.weightText = null;
    Entity.call(this, game, 0, 400);
}

FatCats.prototype = new Entity();
FatCats.prototype.constructor = FatCats;

FatCats.prototype.update = function () {
    if ((this.game.timer.gameTime - this.lastTime) > 0.999 && (!this.game.gameboard.win && !this.game.gameboard.loss)) {
this.weight--;
this.lastTime = this.game.timer.gameTime;
}
    Entity.prototype.update.call(this);
}

FatCats.prototype.draw = function (ctx) {

    if (null === this.weightText) {
        this.weightText = new Kinetic.Text({
            x: 95,
            y: 50,
            text: this.weight,
            fontSize: 30,
            fontFamily: 'sans-serif',
            fill: "Red"
        });
        
        this.game.scoreBoard.add(this.weightText);

        this.username = new Kinetic.Text({
            x: 95,
            y: 20,
            text: USERNAME,
            fontSize: 20,
            fontFamily: 'sans-serif',
            fill: "Red"
        });
        this.game.scoreBoard.add(this.username);

    }

    this.username.setText(USERNAME);
    this.weightText.setText(this.weight);
    this.weightText.fontStyle('bold');
    this.game.scoreBoard.draw();
    this.game.baseLayer.batchDraw();

    var text;

if (this.game.gameboard.loss) {
text = new Kinetic.Text({
x: 230,
y: 320,
text: "YOU LOSE!!",
fontSize: 60,
fontFamily: 'sans-serif',
fill: "Red"
});
text.fontStyle('bold');
this.game.scoreBoard.draw();
this.game.scoreBoard.add(text);
this.game.towerholder.cleanup(ctx);
    }

if (this.game.gameboard.win) {
	text = new Kinetic.Text({
		x: 230,
		y: 320,
		fontSize: 60,
		text: "YOU WIN!!",
		fontFamily: 'sans-serif',
		fill: "Red"
	});
	text.fontStyle('bold');
	this.game.scoreBoard.draw();
	this.game.scoreBoard.add(text);
	 
	this.game.towerholder.cleanup(ctx);
	
	}
}

function Tower(game, x, y, width, height, image, draggable, healthy) {
    this.image = image;
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.layer = new Kinetic.Layer();
    this.imagedraw = true;
    this.boundingcircle = new BoundingCircle(this.x + (this.width/2), this.y + (this.height/2), 150);
    this.request = false;
	this.goodfood = healthy;
    this.circle;
    this.text = new Kinetic.Text({
     x: this.x,
     y: this.y,
     fontSize: 12,
     fontFamily: 'sans-serif',
     fill: "Red",
     visible: false,
     listening: false
     });
this.layer.add(this.text);
this.game.stage.add(this.layer);
    this.startX = x;
    this.startY = y;
this.cooldown = false;
this.cdTime = 0;
this.animation = null;
this.draggable = draggable;
    Entity.call(this, game, x, y);
}

Tower.prototype = new Entity();
Tower.prototype.constructor == Tower;

Tower.prototype.update = function () {
if (this.cooldown) {
if ((this.game.timer.gameTime - this.cdTime) > 3) {
this.cooldown = false;
this.text.visible(false);
}
}

if (null != this.animation) {
this.animation.stop();
}
    Entity.prototype.update.call(this);
}

Tower.prototype.draw = function (ctx) {
    var that = this;
    this.layer.draw();
    if (this.cooldown) {
        var timeLeft = (3 - Math.floor(this.game.timer.gameTime - this.cdTime));
        this.text.setText(timeLeft.toString());
        this.text.visible(true);
        this.text.draw();
    }
  
    
    if (this.imagedraw) {
        this.the_image = new Kinetic.Image({
            image: this.image,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            opacity: 1,
            offset: [33, 33],
            draggable: this.draggable
        });

        this.layer.add(this.the_image);
        this.game.stage.add(this.layer);
        this.imagedraw = false;

        var that = this;
        this.the_image.on('dragstart', function (event) {
            that.startX = this.getX();
            that.startY = this.getY();
            GenerateTower(that.game, that.startX, that.startY, that.width, that.height, that.image.src, that.goodfood);
        });

        this.the_image.on('dragend', function (event) {
            that.request = true;
            that.x = that.the_image.getX();
            that.y = that.the_image.getY();

            that.text.x(that.x + that.width / 2);
            that.text.y(that.y);
            that.boundingcircle.x = that.x + (that.width / 2);
            that.boundingcircle.y = that.y + (that.height / 2);
            that.circle = new Kinetic.Circle({
                x: that.boundingcircle.x,
                y: that.boundingcircle.y,
                radius: that.boundingcircle.radius,
                stroke: 'green',
                strokeWidth: 2,
                opacity: 0.5,
                listening: false
            });
            that.layer.add(that.circle);
            that.game.stage.add(that.layer);

            if (!is_debug) {
                console.log('dragend');
                console.log(that.the_image.x);
                console.log(that.the_image.y);
            }
        });

    }

    var that = this;
    var angularSpeed = 360 / 6;
    if (this.request) {
        that.the_image.roation = 0;
        that.animation = new Kinetic.Animation(function(frame) {
            var angleDiff = frame.timeDiff * angularSpeed / 1000;
            that.the_image.rotate(angleDiff);
        }, that.layer);
       
        that.animation.start();
        
    } else {
        this.layer.draw(this.the_image);
    }
}

function GenerateTower(game, x, y, height, width, image, healthy) {
    
    var newimage = new String(image);
    newimage = newimage.substring(newimage.lastIndexOf("/") + 1, newimage.length);
   
    var t = new Tower(game, x, y, 75, 75, ASSET_MANAGER.getAsset('./Images/' + newimage), false, healthy);
    game.towerholder.towers.push(t);
    game.addEntity(t);
}

function TowerHolder(game) {
    
    var towercount = [];
    towercount.push(ASSET_MANAGER.getAsset("./Images/dog_one.png"));
    towercount.push(ASSET_MANAGER.getAsset("./Images/cham.png"));
    towercount.push(ASSET_MANAGER.getAsset("./Images/mouse.png"));
    towercount.push(ASSET_MANAGER.getAsset("./Images/freezer_one.png"));
    this.game = game;
    this.towers = [];
    game.addEntity(this);

    var increment = 100;
    var y = 100;

    for (var i = 0; i < towercount.length; i++) {
       var t = new Tower(game, 715, y, 75, 75, towercount[i], true, i % 2 === 0 ? true : false);
       this.towers.push(t);
       game.addEntity(t);
       y = y + increment;
    }
    this.towercount = towercount;
    Entity.call(this, game, 0, 0);
}

TowerHolder.prototype = new Entity();
TowerHolder.prototype.constructor = TowerHolder;

TowerHolder.prototype.update = function () {
    var g = 0;
    var i = 0;
    for (g; g < this.towers.length; g++) {
        if (!this.towers[g].cooldown) {
            for (i; i < this.game.gameboard.food.length; i++) {
				if (this.towers[g].goodfood === this.game.gameboard.food[i].goodfood) {
					if (this.towers[g].boundingcircle.collide(this.game.gameboard.food[i].boundingcircle)) {
						this.towers[g].cooldown = true;
						this.towers[g].cdTime = this.game.timer.gameTime;
						console.log(this.towers[g].cdTime);
						this.game.gameboard.finished++;
						this.game.gameboard.food[i].removeFromWorld = true;
						this.game.gameboard.food[i].image.remove(this.image);
						if (is_debug) {
							console.log("collision!");
						}
					}
				}
            }
        }
    }
    Entity.prototype.update.call(this);
}


TowerHolder.prototype.draw = function (ctx) {
    
    
}

TowerHolder.prototype.cleanup = function (ctx) {
    var g = 0;

    for (g; g < this.towers.length; g++) {
        if (this.towers[g].animation != null) {
            this.towers[g].image.remove();
        }
    }

    this.game.foodLayer.removeChildren();
}


function BoundingCircle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

BoundingCircle.prototype.collide = function (oth) {
    if (Math.abs(this.x - oth.x) < (this.radius + oth.radius) && Math.abs(this.y - oth.y) < (this.radius + oth.radius)) return true;
    return false;
}


function GameBoard(game) {
    Entity.call(this, game, 0, 0);
    this.gamedraw = true;
    this.loss = false;
this.win = false;
this.finished = 0;
this.numEnemies = 20;
    this.money = 0;
    this.last = 0;
    this.grid = false;
this.difficulty = 0.9;
this.path = [{x:120, y:71},{x:120, y:198},{x:563, y:198},{x:563, y:455},{x:385, y:455},{x:385, y:368},{x:120, y:368},{x:120, y:540}];
game.addEntity(this)

var foodImages = [,];
foodImages.push(ASSET_MANAGER.getAsset("./Images/grapes.png"));	
foodImages.push(ASSET_MANAGER.getAsset("./Images/pie.png"));
foodImages.push(ASSET_MANAGER.getAsset("./Images/apple.png"));
foodImages.push(ASSET_MANAGER.getAsset("./Images/hamburger.png"));
foodImages.push(ASSET_MANAGER.getAsset("./Images/popsicle.png"));
foodImages.push(ASSET_MANAGER.getAsset("./Images/cupcake.png"));

this.food = [];
for (var i = 0; i < this.numEnemies; i++) {	
var f = new FoodEnemy(game, 40, 40, NewPath(this.path), this.difficulty, i*0.6, foodImages[ i % 6], i % 2 === 0 ? true : false);
        this.food.push(f);
        game.addEntity(f);
}
this.fatcat = new FatCats(game, this.food);
game.addEntity(this.fatcat);	
Entity.call(this, game, 0, 0);
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.cloneBoard = function () {

}

GameBoard.prototype.update = function () {
this.game.timer.tick();

    for (var i = 0; i < this.food.length; i++) {
        if (this.food[i].removeFromWorld) {
            this.food.splice(i, 1);	
        }
    }
if (this.finished === this.numEnemies) {
    this.win = true;
if (USERNAME !== "Guest") {
ajaxs.prototype.my_ajax_post("user_name="+USERNAME+"&points="+POINTS,"mysqlupd.php",null,true);
}
this.finished = 0;
}

if (this.fatcat.weight > 100 || this.fatcat.weight < 40) {
    this.loss = true;
}
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {
 
    if (this.gamedraw) {
        var the_image = new Kinetic.Image({
            image: ASSET_MANAGER.getAsset("./Images/garden_map_and_UI.png"),
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            draggable: false
        });

        this.game.baseLayer.add(the_image);


        var the_cat_image = new Kinetic.Image({
            image: ASSET_MANAGER.getAsset("./Images/the_cat.png"),
            x: 90,
            y: 510,
            width: 100,
            height: 100,
            draggable: false
        });

        this.game.baseLayer.add(the_cat_image);
        this.game.baseLayer.draw();
        this.gamedraw = false;
    }
    Entity.prototype.draw.call(this);
}

function NewPath(path) {
this.offset = Math.floor((Math.random() * 40) - 20);
this.newPath = [];
for (var i = 0; i < path.length; i++) {
this.newPath.push({x:path[i].x + this.offset,y:path[i].y + this.offset});
}
    return newPath;
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./Images/garden_map_and_UI.png");
ASSET_MANAGER.queueDownload("./Images/the_cat.png");
ASSET_MANAGER.queueDownload("./Images/dog.gif");
ASSET_MANAGER.queueDownload("./Images/path.png");
ASSET_MANAGER.queueDownload("./Images/watermelon.png");
ASSET_MANAGER.queueDownload("./Images/cham.png");
ASSET_MANAGER.queueDownload("./Images/freezer_one.png");
ASSET_MANAGER.queueDownload("./Images/mouse.png");
ASSET_MANAGER.queueDownload("./Images/dog_one.png");
ASSET_MANAGER.queueDownload("./Images/apple.png");
ASSET_MANAGER.queueDownload("./Images/grapes.png");
ASSET_MANAGER.queueDownload("./Images/hamburger.png");
ASSET_MANAGER.queueDownload("./Images/pie.png");
ASSET_MANAGER.queueDownload("./Images/popsicle.png");

ASSET_MANAGER.downloadAll(function () {

    if (is_debug) {
        console.log("starting up da sheild");
    }
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
});
