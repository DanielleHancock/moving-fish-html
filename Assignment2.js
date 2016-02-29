"use strict";

var canvas;
var gl;


var maxNumTriangles = 10000;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var pBuffer; // the position
var cBuffer; // the color

var moveVertical = 0;
var moveVerticalLOC;
var whichDirection = 0;

// variable to make the fish move to the right
var moveAmountLOC;
var moveAmount = 0;
var moveAmountRedLOC;
var moveAmountRed = 0;
var moveWaves = 0;
var moveWavesLOC;
var whichDirectionWaves = 0;

// var to flip the image horizontally
var myFlipImageButton;
var isFlippedLOC;
var isFlipped = 1;

var colors = [
    vec4(1,.97,.27,1), // yellow 0
    vec4(.37,1,.33,1), // green 1
    vec4(1,.58,.83,1), // pink 2
    vec4(1,.16,.16,1), // red 3
    vec4(1,.64,.1,1), // orange 4
    vec4(0,0,0,1), //black 5
    vec4(0.7, 0.9, 0.9, 1.0), //light blue 6
    vec4(0.03,0,0,1) // black - used only for eyes of red fish 7
]


// callback function that starts once html window is loaded
window.onload = function init() {

    // associate canvas with "gl-canvas"
    canvas = document.getElementById( "gl-canvas" );

    // setup WebGL presence in canvas, if that fails complain
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // register callback function when mouse is clicked on the canvas
    canvas.addEventListener("mousedown", function(event) {
        moveAmount += .05; // add .01 to moveAmount whenever button is clicked
        moveAmountRed += .2;
    } );

    // register callback function when button is clicked
    myFlipImageButton = document.getElementById("FlipImageButton");
    myFlipImageButton.addEventListener("click", function() {
        isFlipped = isFlipped * -1;
    } );


    // set up orthgraphic view using the entire canvas, and
    // set the default color of the view
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.05,0.41,0.58,1);
    //
    //  Compile and load vertex and fragment shaders
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    // Vertices have two attributes, position and color, which will
    // require two buffers
    //

    // associate moveAmountLOC with moveAmount in vertex-shader
    moveAmountLOC = gl.getUniformLocation(program,"moveAmount");
    moveAmountRedLOC = gl.getUniformLocation(program,"moveAmountRed");
    isFlippedLOC = gl.getUniformLocation(program,"isFlipped");
    moveVerticalLOC = gl.getUniformLocation(program,"moveVertical");
    moveWavesLOC = gl.getUniformLocation(program,"moveWaves");

    // set up pBuffer as a buffer where each entry is 8 bytes
    // (2X4 bytes, or 2 thirtytwo bit floats)
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

    // associate JavaScript vPosition with vertex shader attribute "vPosition"
    // as a two dimensional vector where each component is a float
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition)
    //
    // set up cBuffer as a buffer where each entry is 16 bytes
    // (4x4 bytes, of 4 thirtytwo bit colors)
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW);

    // associate JavaScript vColor with vertex shader attribute "vColor"
    // as a four dimensional vector (RGBA)
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // drawing the image starts here:
    drawCircle(.6,1.3,.5,50,colors[6]);
    drawCircle(-.2,1.3,.5,50, colors[6]);
    drawCircle(-1,1.3,.5,50,colors[6]);

    drawFish(0,0,.1,colors[2]);
    drawFish(-.5, .6,.15,colors[0]);
    drawFish(.7, -.6,.05, colors[1]);
    drawFish(-.3, -.8,.1,colors[3]);
    drawFish(.2,.4,.07,colors[3]);
    drawFish(.6,.6,.1,colors[0]);
    drawFish(-.7, -.2,.12,colors[3]);
    drawFish(.2,-.4,.09, colors[1]);
    drawFish(.7,0,.15,colors[2]);
    drawFish(-.4, -.4,.05,colors[4]);
    drawFish(.4, -.8,.07,colors[4]);
    drawFish(-.5,.15,.07,colors[1]);
    drawFish(-.8, -.7,.06,colors[0]);
    drawFish(.8, -.3,.05,colors[3]);
    drawFish(-.05,.7,.05,colors[4]);

    // render away
    render();
}


// recursive function to render
function render() {

    // clear the working buffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    // move fish up
    if (whichDirection==0) {
        moveVertical += .001;
        if (moveVertical>.0) // switch direction
            whichDirection=1;
    }

    // move fish down
    if (whichDirection==1) {
        moveVertical -= .001;
        if (moveVertical<-.05) // switch direction
            whichDirection=0;
    }

    // move waves right
    if (whichDirectionWaves==0) {
        moveWaves += .001;
        if (moveWaves>=.1) // switch direction
            whichDirectionWaves=1;
    }

    // move waves left
    if (whichDirectionWaves==1) {
        moveWaves -= .001;
        if (moveWaves<=0) // switch direction
            whichDirectionWaves=0;
    }



    // pass the value of js variable moveAmountLOC
    // to the vertex shader uniform moveAmount
    gl.uniform1f(moveAmountLOC,moveAmount);
    gl.uniform1f(moveAmountRedLOC, moveAmountRed);
    gl.uniform1f(moveVerticalLOC,moveVertical);
    gl.uniform1f(isFlippedLOC,isFlipped);
    gl.uniform1f(moveWavesLOC,moveWaves);

    // render index vertices and colors from their buffers
    gl.drawArrays( gl.TRIANGLES, 0, index );

    // recursively call render() in the context of the browser
    window.requestAnimFrame(render);
}

// draw a triangle with vertices (ax,ay), (bx,by), and (cx,cy), all the specified color
function drawTriangle(ax, ay, bx, by, cx, cy, color) {
    // focus on vBuffer (vertexBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    // append flattened vertices to the vertex buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(vec2(ax,ay)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), flatten(vec2(bx,by)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), flatten(vec2(cx,cy)));

    // focus on cBuffer (color buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    // append flattened RGBA color to color vector
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+1), flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+2), flatten(color));

    index += 3; // 1 triangle = 3 vertices

}

// draw a rectangle including vertices (ax,ay) and (bx,by), which should be opposite each other
function drawRectangle(ax,ay,bx,by,color) {
    // focus on vBuffer (vertexBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    // append flattened vertices to the vertex buffer
    // first triangle
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(vec2(ax,ay)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), flatten(vec2(bx,by)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+2), flatten(vec2(ax,by)));

    // second triangle
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+3), flatten(vec2(ax,ay)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+4), flatten(vec2(bx,by)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+5), flatten(vec2(bx,ay)));

    // focus on cBuffer (color buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    // append flattened RGBA color to color vector
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+1), flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+2), flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+3), flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+4), flatten(color));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+5), flatten(color));

    index += 6; // 2 triangles = 6 vertices


}

// draw a quadrilateral with vertices (ax,ay), (bx,by), (cx,cy) & (dx,dy), in that order (a&c, b&d opposite each other)
function drawQuad(ax,ay,bx,by,cx,cy,dx,dy,color) {
    drawTriangle(ax,ay,bx,by,cx,cy,color);
    drawTriangle(ax,ay,cx,cy,dx,dy,color);

}

// draw an approximation of a circle centered at (cx,cy) using n triangles
function drawCircle(cx, cy, radius, n, color) {
// focus on vBuffer (vertexBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    // append flattened vertices to the vertex buffer
    for(var i=0; i<n; i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3*i), flatten(vec2(cx, cy)));
        var x = cx + radius * Math.cos(i*2*Math.PI/n);
        var y = cy + radius * Math.sin(i*2*Math.PI/n);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3*i+1), flatten(vec2(x,y)));
        //alert(x);
        //alert(y);
        x = cx + radius * Math.cos((i+1)*2*Math.PI/n);
        y = cy + radius * Math.sin((i+1)*2*Math.PI/n);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + 3*i+2), flatten(vec2(x,y)));
        //alert(x);
        //alert(y);
    }

    //alert("finished for loop");
    // focus on cBuffer (color buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    // append flattened RGBA color to color vector
    for ( var j=0; j<3*n; j++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + j), flatten(color));
    }

    index += (n*3); // n triangles = 3n vertices
}

// draw a fish, with the body centered at point (cx,cy) with radius r
function drawFish(cx,cy,r,color) {
    drawCircle(cx, cy, r, 50, color); // body
    drawTriangle(cx - r * .5, cy, cx - 2 * r, cy + r * 1.3, cx - 2 * r, cy - r * 1.3, color); // tail
    if (color == colors[3]) {
       drawCircle(cx + (r / 3), cy + (r / 3), r / 10, 20, colors[7]); // if fish is red, use special eye color
    }
    else drawCircle(cx+(r/3),cy+(r/3),r/10,20,colors[5]); // eye
}
