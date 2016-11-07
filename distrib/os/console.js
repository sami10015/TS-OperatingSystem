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
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, pastXPositions, buffer, backspaceImageDataArray, commandsArray, currentCommandIndex, imageScrollArray, imageScrollIndex, backspaceAmount) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (pastXPositions === void 0) { pastXPositions = [0]; }
            if (buffer === void 0) { buffer = ""; }
            if (backspaceImageDataArray === void 0) { backspaceImageDataArray = []; }
            if (commandsArray === void 0) { commandsArray = []; }
            if (currentCommandIndex === void 0) { currentCommandIndex = 0; }
            if (imageScrollArray === void 0) { imageScrollArray = []; }
            if (imageScrollIndex === void 0) { imageScrollIndex = 0; }
            if (backspaceAmount === void 0) { backspaceAmount = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.pastXPositions = pastXPositions;
            this.buffer = buffer;
            this.backspaceImageDataArray = backspaceImageDataArray;
            this.commandsArray = commandsArray;
            this.currentCommandIndex = currentCommandIndex;
            this.imageScrollArray = imageScrollArray;
            this.imageScrollIndex = imageScrollIndex;
            this.backspaceAmount = backspaceAmount;
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
                    this.commandsArray.push(this.buffer); //Add to commands list for up and down arrow key use(command history recall)
                    this.currentCommandIndex = this.commandsArray.length - 1; //Update the current command index to the last command in the array
                    // ... and reset our buffer.
                    this.backspaceAmount = 0; //Reset the backspace amount
                    this.buffer = ""; //Reset the buffer
                }
                else if (chr == String.fromCharCode(8)) {
                    if (this.backspaceAmount != 0) {
                        _DrawingContext.putImageData(this.backspaceImageDataArray.pop(), 0, 0); //Retrieve image data of previously drawn word
                        this.currentXPosition = this.pastXPositions.pop(); //Retrieve past X position for Canvas drawing, and set it to the current X position
                        this.backspaceAmount -= 1; //Allow one less backspace
                    }
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1); //Adjust buffer for kernel
                }
                else if (chr == String.fromCharCode(9)) {
                    //Have a command list array
                    var commandList = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13", "prompt", "date", "whereami", "kratos", "load", "status", "error"]; //Must update when adding commands
                    //Find the closest command that relates to the buffer using temporary counter and index
                    var count = 0;
                    var index = 0;
                    for (var i = 0; i < commandList.length; i++) {
                        var tempCount = 0;
                        for (var j = 0; j < this.buffer.length; j++) {
                            if (commandList[i].charAt(j) == this.buffer.charAt(j)) {
                                tempCount++;
                            }
                            else {
                                break;
                            }
                        }
                        if (tempCount > count) {
                            count = tempCount;
                            index = i;
                        }
                    }
                    //There is a match for the TAB key
                    if (count > 0) {
                        //Use backspacing techniques to clear the canvas before drawing the complete command with the TAB key
                        for (var i = this.buffer.length - 1; i > 0; i--) {
                            this.backspaceImageDataArray.pop(); //Remove the last few saved images to arrange backspace list correctly
                        }
                        _DrawingContext.putImageData(this.backspaceImageDataArray.pop(), 0, 0); //Retrieve the cleared command line
                        this.buffer = ''; //Clear the buffer
                        this.currentXPosition = this.pastXPositions[2]; //Reset the X Position ([1] = 0, [2] = start of command)
                        var tabWord = commandList[index]; //The word that was found 
                        //Must print out the word, along with saving the image data for backspacing purposes
                        for (var i = 0; i < tabWord.length; i++) {
                            this.backspaceImageDataArray.push(_DrawingContext.getImageData(0, 0, 500, 500)); //Save image data for backspacing purposes
                            this.putText(tabWord.charAt(i)); //Display text of each character
                            this.buffer += tabWord.charAt(i); //Add each character to the buffer
                        }
                    }
                }
                else if (chr == String.fromCharCode(38) || chr == String.fromCharCode(40)) {
                    var command;
                    if (chr == String.fromCharCode(38)) {
                        if (this.currentCommandIndex != this.commandsArray.length - 1) {
                            if (this.currentCommandIndex - 1 < 0) {
                                command = this.commandsArray[this.currentCommandIndex];
                                this.currentCommandIndex = 0;
                            }
                            else {
                                command = this.commandsArray[this.currentCommandIndex];
                                this.currentCommandIndex -= 1;
                            }
                        }
                        else {
                            command = this.commandsArray[this.currentCommandIndex];
                            this.currentCommandIndex -= 1;
                        }
                    }
                    else {
                        if (this.currentCommandIndex != this.commandsArray.length - 1) {
                            command = this.commandsArray[this.currentCommandIndex + 1];
                            this.currentCommandIndex += 1;
                        }
                    }
                    if (this.buffer != "") {
                        for (var i = this.buffer.length - 1; i > 0; i--) {
                            this.backspaceImageDataArray.pop(); //Remove the last few saved images to arrange backspace list correctly
                        }
                        _DrawingContext.putImageData(this.backspaceImageDataArray.pop(), 0, 0); //Retrieve the cleared command line
                        this.buffer = ''; //Clear the buffer
                        this.currentXPosition = this.pastXPositions[2]; //Reset the X Position ([1] = 0, [2] = start of command)
                    }
                    //Draw the previous command onto the canvas
                    for (var i = 0; i < command.length; i++) {
                        this.backspaceImageDataArray.push(_DrawingContext.getImageData(0, 0, 500, 500)); //Save image data for backspacing purposes
                        this.putText(command.charAt(i)); //Display text of each character
                        this.buffer += command.charAt(i); //Add each character to the buffer
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.backspaceImageDataArray.push(_DrawingContext.getImageData(0, 0, 500, 500)); //Save image data for backspacing purposes
                    this.putText(chr); //Display text
                    // ... and add it to our buffer.
                    this.backspaceAmount += 1; //Allow one more backspace
                    this.buffer += chr; //Add to buffer
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
                if (this.currentXPosition + offset >= 490) {
                    this.currentXPosition = 0;
                    this.advanceLine();
                }
                else {
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            //Y position in the canvas
            var moveTotal = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            //If the command is going to go off the canvas, go into this if 
            if (this.currentYPosition + moveTotal > 500) {
                this.imageScrollArray.push(_DrawingContext.getImageData(0, 0, 500, 500)); //Getting current snapshot of canvas besides bottom line and pushing to image array
                this.clearScreen(); //Clear the screen
                _DrawingContext.putImageData(this.imageScrollArray[this.imageScrollIndex], 0, -(moveTotal)); //Put the image located above the canvas
                this.imageScrollIndex += 1; //Increment Scrolling Index
            }
            else {
                this.currentYPosition += moveTotal; //If not increment the Y position downward
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
