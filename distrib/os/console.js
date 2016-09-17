///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, pastXPositions, buffer, backspaceImageDataArray) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (pastXPositions === void 0) { pastXPositions = [0]; }
            if (buffer === void 0) { buffer = ""; }
            if (backspaceImageDataArray === void 0) { backspaceImageDataArray = []; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.pastXPositions = pastXPositions;
            this.buffer = buffer;
            this.backspaceImageDataArray = backspaceImageDataArray;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr == String.fromCharCode(8)) {
                    //Retrieve image data of previously drawn word
                    _DrawingContext.putImageData(this.backspaceImageDataArray.pop(), 0, 0);
                    this.currentXPosition = this.pastXPositions.pop(); //Retrieve last past X position 
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1); //Adjust buffer for kernel purposes
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.backspaceImageDataArray.push(_DrawingContext.getImageData(0, 0, 500, 500)); //Save image data for backspacing purposes
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                //Save previous X position for backspacing purposes
                this.pastXPositions.push(this.currentXPosition);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // this.currentXPosition = 0;
            // /*
            //  * Font size measures from the baseline to the highest point in the font.
            //  * Font descent measures from the baseline to the lowest point in the font.
            //  * Font height margin is extra spacing between the lines.
            //  */
            // //Y position in the canvas
            // var moveTotal = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +_FontHeightMargin;
            // // if(this.currentYPosition + moveTotal > 500){
            // //     //Getting current snapshot of canvas
            // //     this.imageDataArray.push(_DrawingContext.getImageData(0,0,500,500-moveTotal));
            // // } 
            // this.currentYPosition += moveTotal;
            // TODO: Handle scrolling. (iProject 1)
            //Save image data, paste image data onto screen of the previous image from image data array
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
