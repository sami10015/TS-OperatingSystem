///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public pastXPositions = [0],
                    public buffer = "",
                    public backspaceImageDataArray = [],
                    public commandsArray = [],
                    public currentCommandIndex = 0,
                    public imageScrollArray = [],
                    public imageScrollIndex = 0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    this.commandsArray.push(this.buffer); //Add to commands list for up and down arrow key use(command history recall)
                    this.currentCommandIndex = this.commandsArray.length-1; //Update the current command index to the last command in the array
                    console.log(this.commandsArray);
                    // ... and reset our buffer.
                    this.buffer = "";

                } else if (chr == String.fromCharCode(8)) { //Backspace Key
                    _DrawingContext.putImageData(this.backspaceImageDataArray.pop(),0,0); //Retrieve image data of previously drawn word
                    this.currentXPosition = this.pastXPositions.pop(); //Retrieve past X position for Canvas drawing, and set it to the current X position
                    this.buffer = this.buffer.substring(0, this.buffer.length-1); //Adjust buffer for kernel

                } else if(chr == String.fromCharCode(9)){ //Tab key
                    //Have a command list array
                    var commandList = ["ver","help","shutdown","cls","man","trace","rot13","prompt","date","whereami","kratos","load","status", "error"]; //Must update when adding commands
                    //Find the closest command that relates to the buffer using temporary counter and index
                    var count = 0;
                    var index = 0;
                    for(var i = 0; i < commandList.length; i++){
                        var tempCount = 0;
                        for(var j = 0; j < this.buffer.length; j++){
                            if(commandList[i].charAt(j) == this.buffer.charAt(j)){
                                tempCount++;
                            }else{
                                break;
                            }
                        }
                        if(tempCount > count){
                            count = tempCount;
                            index = i;
                        }
                    }
                    //There is a match for the TAB key
                    if(count > 0){
                        //Use backspacing techniques to clear the canvas before drawing the complete command with the TAB key
                        for(var i = this.buffer.length - 1; i > 0; i--){
                            this.backspaceImageDataArray.pop(); //Remove the last few saved images to arrange backspace list correctly
                        }
                        _DrawingContext.putImageData(this.backspaceImageDataArray.pop(),0,0); //Retrieve the cleared command line
                        this.buffer = ''; //Clear the buffer
                        this.currentXPosition = this.pastXPositions[2]; //Reset the X Position ([1] = 0, [2] = start of command)
                        var tabWord = commandList[index]; //The word that was found 
                        //Must print out the word, along with saving the image data for backspacing purposes
                        for(var i = 0; i < tabWord.length; i++){
                            this.backspaceImageDataArray.push(_DrawingContext.getImageData(0,0,500,500)); //Save image data for backspacing purposes
                            this.putText(tabWord.charAt(i)); //Display text of each character
                            this.buffer += tabWord.charAt(i); //Add each character to the buffer
                        }
                    }                     

                } else if (chr == String.fromCharCode(38) || chr == String.fromCharCode(40)){ //Up or Down Arrow
                    var command;
                    if(chr == String.fromCharCode(38)){ //Up Arrow
                        if(this.currentCommandIndex != this.commandsArray.length-1){
                            if(this.currentCommandIndex - 1 < 0){
                                command = this.commandsArray[this.currentCommandIndex];
                                this.currentCommandIndex = 0;
                            }else{
                                command = this.commandsArray[this.currentCommandIndex];
                                this.currentCommandIndex -= 1;
                            }
                        }else{
                            command = this.commandsArray[this.currentCommandIndex];  
                            this.currentCommandIndex -= 1;  
                        }

                        console.log(this.currentCommandIndex);
                    }else{ //Down Arrow
                        if(this.currentCommandIndex != this.commandsArray.length-1){ //Save from index error
                            command = this.commandsArray[this.currentCommandIndex+1];
                            this.currentCommandIndex += 1;
                            console.log(this.currentCommandIndex);    
                        }                        
                    }
                    if(this.buffer != ""){
                        for(var i = this.buffer.length - 1; i > 0; i--){
                            this.backspaceImageDataArray.pop(); //Remove the last few saved images to arrange backspace list correctly
                        }
                        _DrawingContext.putImageData(this.backspaceImageDataArray.pop(),0,0); //Retrieve the cleared command line
                        this.buffer = ''; //Clear the buffer
                        this.currentXPosition = this.pastXPositions[2]; //Reset the X Position ([1] = 0, [2] = start of command)
                    }                    
                    
                    //Draw the previous command onto the canvas
                    for(var i = 0; i < command.length; i++){
                        this.backspaceImageDataArray.push(_DrawingContext.getImageData(0,0,500,500)); //Save image data for backspacing purposes
                        this.putText(command.charAt(i)); //Display text of each character
                        this.buffer += command.charAt(i); //Add each character to the buffer
                    }

                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.backspaceImageDataArray.push(_DrawingContext.getImageData(0,0,500,500));  //Save image data for backspacing purposes
                    this.putText(chr); //Display text
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
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
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            
            //Y position in the canvas
            var moveTotal = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +_FontHeightMargin;
            
            //If the command is going to go off the canvas, go into this if 
            if(this.currentYPosition+moveTotal > 500){
                this.imageScrollArray.push(_DrawingContext.getImageData(0,0,500,500)); //Getting current snapshot of canvas besides bottom line and pushing to image array
                this.clearScreen(); //Clear the screen
                _DrawingContext.putImageData(this.imageScrollArray[this.imageScrollIndex],0,-(moveTotal)); //Put the image located above the canvas
                this.imageScrollIndex += 1; //Increment Scrolling Index
            }else{
                this.currentYPosition += moveTotal; //If not increment the Y position downward
            } 
        }
    }
 }
