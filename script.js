/**@function
 * Constructor for Invaders.
 * @param {number} x - The x coordinate to spawn the invader at
 * @param {number} y - The y coordinate to spawn the invader at
 * @return {Invader} - The new Invader object
 */
function Invader(x,y)
{
    this.x = x;
    this.y = y;
    this.alive = true;
}

/**@function
 * Constructor for both enemy and player bullets
 * @param {number} x - The x coordinate to spawn the bullet at
 * @param {number} y - The y coordinate to spawn the bullet at
 * @param {number} angle - The angle (in radians) that points in
 * the direction that the bullet will move
 * @return {Bullet} - The new Bullet object
 */
function Bullet(x,y,angle)
{
    this.x = x;
    this.y = y;
    this.vx = BULLET_SPEED*Math.cos(angle);
    this.vy = -BULLET_SPEED*Math.sin(angle);
    this._x = this.x;
    this._y = this.y;
    this.alive = true;
}

/**@function
 * Instantiates the entire game
 */
function init()
{
    canvas = document.getElementById("canvas");
    realContext = canvas.getContext("2d");
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferContext = bufferCanvas.getContext("2d");
    context = bufferContext;

    deltaTime = -1;
    input = [];
    input._fire = false;
    fireTimer = 0;
    FIRE_TIME = .1;
    invaderTimer = 0;
    invaderTime = 1;
    score = 0;
    lives = 3;
    playing = true;

    invaderRect = [];
    invaderRect.x = 0;
    invaderRect.y = 0;
    invaderRect.width = 400;
    invaderRect.height = 200;
    invaderRect.dx = 1;
    invaderWidth = 10;
    invaderHeight = 10;

    invaders = [];
    for(var y = 0; y < invaderRect.height; y += 2*invaderHeight)
    {
        for(var x = 0; x < invaderRect.width; x += 2*invaderWidth)
        {
            invaders.push(new Invader(x,y));
        }
    }

    BULLET_SPEED = 500;
    bullets = [];
    invaderBullets = [];

    MAX_INVADERS = invaders.length;

    player = [];
    player.x = 400-10;
    player.y = 600-60;
    player.width = 20;
    player.height = 20;
}

/** @function
 * Checks whether or not a point is outside of the playing field
 * @param {number} x - The x coordinate to check
 * @param {number} y - The y coordinate to check
 * @return {boolean} - Whether or not the point was on the playing field
 */
function outside(x,y)
{
    return (x<0||x>=canvas.width)||(y<0||y>canvas.height);
}

/** @function
 * Tests to see if a point collides with an invader, and if it does, remove said invader
 * @param {number} x - The x coordinate of the point to test
 * @param {number} y - The y coordinate of the point to test
 * @return {boolean} - Whether or not the point collided with an invader
 */
function collidesWithInvader(x,y)
{
    var cellX = Math.floor(x/invaderWidth/2);
    var cellY = Math.floor(y/invaderHeight/2);
    var cellPosX = x-cellX*invaderWidth*2;
    var cellPosY = y-cellY*invaderHeight*2;
    if(cellPosX>invaderWidth||cellPosY>invaderHeight)
    {
        return false;
    }
    var invader = invaders[cellX+cellY*invaderRect.width/invaderWidth/2];
    if(invader.alive)
    {
        score += 10;
        invader.alive = false;
        return true;
    } else return false;
}

/** @function
 * Updates all game logic such as player controlling, collision, motion, and game state.
 * At finishing, it sets up a call to call itself again on the next frame.
 * @param {number} elapsedTime - The time in seconds since the start of the program
 */
function update(elapsedTime)
{
    if(deltaTime==-1) deltaTime = 0;
    else {
        deltaTime = (elapsedTime - _elapsedTime)/1000;
    }
    _elapsedTime = elapsedTime;

    if(isNaN(deltaTime)) deltaTime = 0;

    if(!playing)
    {
        if(input.fire&&!input._fire)
        {
            init();
        }
        render();
        window.requestAnimationFrame(update);
        input._fire = input.fire;
        return;
    }

    var invaderSpeed = (MAX_INVADERS - invaders.length)*300 + 200;
    if(invaderRect.x+invaderRect.dx*invaderSpeed*deltaTime<0||invaderRect.x+invaderRect.dx*invaderSpeed*deltaTime>=800-invaderRect.width)
    {
        invaderRect.dx *= -1;
        invaderRect.y += 15;
    }
    invaderRect.x += invaderRect.dx*invaderSpeed*deltaTime;
    for(var i = 0; i < bullets.length; i++)
    {
        bullets[i]._x = bullets[i].x;
        bullets[i]._y = bullets[i].y;
        bullets[i].x += bullets[i].vx*deltaTime;
        bullets[i].y += bullets[i].vy*deltaTime;

        if(bullets[i].x>=invaderRect.x&&bullets[i].x<invaderRect.x+invaderRect.width&&
        bullets[i].y>=invaderRect.y&&bullets[i].y<invaderRect.y+invaderRect.height)
        {
            let b = collidesWithInvader(bullets[i].x-invaderRect.x,bullets[i].y-invaderRect.y);
            if(b)
            {
                bullets[i].alive = false;
                let num = 0;
                for(let j = 0; j < invaders.length; j++) if(invaders[j].alive) num++;
                if(num==0)
                {
                    let _x = player.x;
                    let _score = score;
                    let _lives = lives;
                    init();
                    player.x = _x;
                    score = _score;
                    lives = _lives;
                    render();
                    window.requestAnimationFrame(update);
                    input._fire = input.fire;
                    return;
                }
            }
        }

        if((outside(bullets[i].x,bullets[i].y)&&outside(bullets[i]._x,bullets[i]._y))||!bullets[i].alive)
        {
            bullets[i] = bullets[bullets.length-1];
            bullets.pop();
            i--;
        }
    }

    for(var i = 0; i < invaderBullets.length; i++)
    {
        invaderBullets[i]._x = invaderBullets[i].x;
        invaderBullets[i]._y = invaderBullets[i].y;
        invaderBullets[i].x += invaderBullets[i].vx*deltaTime;
        invaderBullets[i].y += invaderBullets[i].vy*deltaTime;

        if(invaderBullets[i].x>=player.x&&invaderBullets[i].x<player.x+player.width&&
        invaderBullets[i].y>=player.y&&invaderBullets[i].y<player.y+player.height)
        {
            invaderBullets[i].alive = false;
            lives--;
        }

        if((outside(invaderBullets[i].x,invaderBullets[i].y)&&outside(invaderBullets[i]._x,invaderBullets[i]._y))||!invaderBullets[i].alive)
        {
            invaderBullets[i] = invaderBullets[invaderBullets.length-1];
            invaderBullets.pop();
            i--;
        }
    }


    if(input.left) player.x -= 400*deltaTime;
    if(input.right) player.x += 400*deltaTime;
    if(player.x<0) player.x = 0;
    if(player.x>canvas.width-player.width) player.x = canvas.width-player.width;

    fireTimer += deltaTime;
    if(input.fire&&fireTimer>=FIRE_TIME)
    {
        bullets.push(new Bullet(player.x+player.width/2,player.y,Math.PI/4));
        bullets.push(new Bullet(player.x+player.width/2,player.y,2*Math.PI/4));
        bullets.push(new Bullet(player.x+player.width/2,player.y,3*Math.PI/4));
        fireTimer = 0;
    }

    invaderTimer += deltaTime;
    if(invaderTimer>=invaderTime)
    {
        let i = Math.floor(Math.random()*MAX_INVADERS);
        let width = Math.floor(invaderRect.width/invaderWidth/2);
        if(invaders[i].alive)
        {
            invaderBullets.push(new Bullet(invaderRect.x+(i%width)*invaderWidth*2+invaderWidth/2,invaderRect.y+(i/width)*invaderHeight*2+invaderHeight,-Math.PI/2));
        }
        invaderTimer = 0;
        invaderTime = Math.random()*.2+.1;
    }
    
    if(invaderRect.y+invaderRect.height>=player.y||lives<=0)
    {
        playing = false;
    }

    input._fire = input.fire;
    render();
    window.requestAnimationFrame(update);
}

/** @function
 * Renders the game to a double buffer, then to the normal buffer
 */
function render()
{
    context.fillStyle = "black";
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "green";
    for(var i = 0; i < invaders.length; i++)
    {
        if(invaders[i].alive) context.fillRect(invaderRect.x+invaders[i].x,invaderRect.y+invaders[i].y,invaderWidth,invaderHeight);
    }
    context.strokeStyle = "red";
    context.lineWidth = 2;
    for(var i = 0; i < bullets.length; i++)
    {
        context.beginPath();
        context.moveTo(bullets[i].x,bullets[i].y);
        context.lineTo(bullets[i]._x,bullets[i]._y);
        context.stroke();
    }
    context.strokeStyle = "yellow";
    context.lineWidth = 2;
    for(var i = 0; i < invaderBullets.length; i++)
    {
        context.beginPath();
        context.moveTo(invaderBullets[i].x,invaderBullets[i].y);
        context.lineTo(invaderBullets[i]._x,invaderBullets[i]._y);
        context.stroke();
    }
    context.fillStyle = "blue";
    context.fillRect(player.x,player.y,player.width,player.height);

    context.strokeStyle = "white";
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Score: " + score,0,canvas.height-10);
    context.fillText("Lives: " + lives,canvas.width/2,canvas.height-10);

    if(!playing)
    {
        context.fillText("Press Fire to restart",canvas.width/2-100,450);
        context.font = "100px Arial";
        context.strokeText("GAME OVER",100,400);
    }

    realContext.drawImage(bufferCanvas,0,0);
}

init()
update();

/** @function
 * Takes a keydown event and sets input flags if necessary
 * @param {Event} event - The keydown event to handle
 */
function keydown(event)
{
    if(event.key=="ArrowLeft") input.left = true;
    if(event.key=="ArrowRight") input.right = true;
    if(event.key==" "||event.key=="z"||event.key=="ArrowUp") input.fire = true;
}

/** @function
 * Takes a keyup event and set input flags if necessary
 * @param {Event} event - The keyup event to handle
 */
function keyup(event)
{
    if(event.key=="ArrowLeft") input.left = false;
    if(event.key=="ArrowRight") input.right = false;
    if(event.key==" "||event.key=="z"||event.key=="ArrowUp") input.fire = false;
}

document.addEventListener("keydown",keydown);
document.addEventListener("keyup",keyup);