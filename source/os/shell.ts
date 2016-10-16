///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
            					  "date",
            					  " - Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
            					  "whereami",
            					  " - Displays current location.");
            this.commandList[this.commandList.length] = sc;

          	// kratos
            sc = new ShellCommand(this.shellKratos,
            					  "kratos",
            					  " - Output random Kratos quote.");
           	this.commandList[this.commandList.length] = sc;

           	// load
           	sc = new ShellCommand(this.shellLoad,
           						  "load",
           						  " - Validate the user code.");
           	this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  " - Change the status.");
            this.commandList[this.commandList.length] = sc;

            // error 
            sc = new ShellCommand(this.shellError,
                                  "error",
                                  " - Test Error.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                   " - Load Program <PID>");
            this.commandList[this.commandList.length] = sc;


            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
            _StdOut.advanceLine();
            _StdOut.putText("Created by Sami Ellougani");
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        //Always update when creating new shell commands
        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                    	_StdOut.putText("Displays the current version data.");
                    	break;
                    case "shutdown":
                    	_StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                    	break;
                    case "cls":
                    	_StdOut.putText("Clears the screen and resets the cursor position.");
                    	break;
                    case "trace":
                    	_StdOut.putText("<on | off> - Turns the OS trace on or off.");
                    	break;
                    case "rot13":
                    	_StdOut.putText("<string> - Does rot13 obfuscation on <string>.");
                    	break;
                    case "prompt":
                    	_StdOut.putText("<string> - Sets the prompt");
                    	break;
                    case "date":
                    	_StdOut.putText("Displays the current date.");
                    	break;
                    case "whereami":
                    	_StdOut.putText("Displays current location.");
                    	break;
                    case "kratos":
                    	_StdOut.putText("Output random Kratos quote.");
                    	break;
                    case "load":
                    	_StdOut.putText("Validate the user code. Load program");
                    	break;
                    case "status":
                        _StdOut.putText("Change the status");
                        break;
                    case "error":
                        _StdOut.putText("Error");
                        break;
                    case "run":
                        _StdOut.putText("Run program based on <PID>");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(){
        	var date = new Date();
        	//Must add plus one to month because it starts at 0
        	_StdOut.putText(date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear());
        }

        //Output random location
        public shellWhereAmI(){
        	//Generate random number between 0 and 2
        	var random = Math.floor((Math.random() * 3));
        	var locations = ["Not outside where you should be.", "In your basement.", "In the Hancock Center"];
        	//Use generated random number to output a new location to the screen everytime
        	_StdOut.putText(locations[random]);
        }

        //Output random Kratos quote
        public shellKratos(){
        	//Generate random number between 0 and 3
        	var random = Math.floor((Math.random() * 4));
        	var quotes = ["If all those on Olympus would deny me my vengeance, then all of Olympus will die.",
        				  "I am what the gods have made me! ",
        				  "Even now, as you draw your last breath, you continue to defy me?",
        				  "By the gods, what have I become?"];
        	_StdOut.putText(quotes[random]);
        }



        //Validates the user program input
        public shellLoad(){
        	//Cast as HTMLInputElement and then retrieve the value within the program input text area
        	var input = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
        	var hexChars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F',' '];
        	//If input is empty, output no input
        	if(input == ''){
        		_StdOut.putText("No input.");
        	}else{
        		//Loop through all possible hex characters(or spaces) and check if they match the input
        		var count = 0;
        		for(var i = 0; i < input.length; i++){
        			var letter = input.charAt(i);
        			for(var j = 0; j < hexChars.length; j++){
        				//Match found in hex characters/digits
        				if(letter == hexChars[j]){
        					count++;
        				}
        			}
        		}
        		//If each letter or digit is in the hex array(or spaces), then the length of count and the input should be the same
        		if(count == input.length){
                    var operation = (<HTMLInputElement>document.getElementById("taProgramInput")).value; //Op Codes

                    //Change process memory table
                    var table = (<HTMLInputElement>document.getElementById("processMemTable"));
                    var HTMLOperation = operation;
                    
                    
                     _CPU.operations.push(operation); //Load OP Codes in Array
        			_StdOut.putText("Program loaded. PID " + (_CPU.operations.length-1));
        		}else{
        			_StdOut.putText("Not Validated.");
        		}
        	}
        }

        //Runs program with PID
        public shellRun(params){
            var pID = '';
            for(var i = 0; i < params.length; i++){
                pID += params[i];
            }

            var x = true;

            //Makes my life easier doing it this way
            for(var i = 0; i < _CPU.pastPID.length; i++){ //Check if that program has been run before, if so it doesn't exist anymore
                if(parseInt(pID) == _CPU.pastPID[i]){
                    _StdOut.putText("PID: " + pID + " does not exist");
                    x = false;
                }
            }
            if(x){
                if(parseInt(pID) == NaN){ //Checks if you entered a number
                    _StdOut.putText("Please enter a numeric PID.");
                }else if(parseInt(pID) > _CPU.operations.length-1){ //Checks if there is a program loaded under specific PID
                    _StdOut.putText("PID: " + pID + " does not exist");
                }else if(pID == ''){ //Check if user put in a PID
                    _StdOut.putText("Please enter a PID along with the run command");
                }else{ //Run CPU if OK
                    _CPU.PID = parseInt(pID); //Change current pID
                    _CPU.programCounter = 0; //Start program counter from 0
                    _CPU.cycle(); //Run CPU 
                    _StdOut.putText("PID: " + pID + " done.");
                }
            }
        }

        //Changes the status of the inner HTML
        public shellStatus(params){
            var word = '';
            for(var i = 0; i < params.length; i++){
                word = word + ' ' + params[i];
            }
            document.getElementById('Status').innerHTML = 'Status: ' + word;
        }

        //Cause a test OS error
        public shellError(){
            _Kernel.krnTrapError("Test Error");
        }
    }
}
