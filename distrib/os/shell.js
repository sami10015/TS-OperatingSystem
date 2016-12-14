///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="processControlBlock.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", " - Displays current location.");
            this.commandList[this.commandList.length] = sc;
            // kratos
            sc = new TSOS.ShellCommand(this.shellKratos, "kratos", " - Output random Kratos quote.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Validate the user code.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", " - Change the status.");
            this.commandList[this.commandList.length] = sc;
            // error 
            sc = new TSOS.ShellCommand(this.shellError, "error", " - Test Error.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", " - Load Program <PID>");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.clearMem, "clearmem", " - Clear all memory allocation");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.quantum, "quantum", " - Sets the quantum for RR");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.runall, "runall", " - Run all loaded programs");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.ps, "ps", " - See all active processes");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.kill, "kill", " - Kill active process");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.format, "format", " - Format the HDD");
            this.commandList[this.commandList.length] = sc;
            // create
            sc = new TSOS.ShellCommand(this.createFile, "create", "<string> - Create a file");
            this.commandList[this.commandList.length] = sc;
            // write
            sc = new TSOS.ShellCommand(this.writeFile, "write", "<string> <string> - Write to file");
            this.commandList[this.commandList.length] = sc;
            // read
            sc = new TSOS.ShellCommand(this.readFile, "read", "<string> - Read a file");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
            _StdOut.advanceLine();
            _StdOut.putText("Created by Sami Ellougani");
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        //Always update when creating new shell commands
        Shell.prototype.shellMan = function (args) {
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
                    case "clearmem":
                        _StdOut.putText("Clear all memory allocation");
                        break;
                    case "quantum":
                        _StdOut.putText("<Integer> - Set the quantum for RR");
                        break;
                    case "runall":
                        _StdOut.putText("Run all loaded programs");
                        break;
                    case "ps":
                        _StdOut.putText("See all active processes");
                        break;
                    case "kill":
                        _StdOut.putText("Kill Active Processes");
                        break;
                    case "format":
                        _StdOut.putText("Format the HDD");
                        break;
                    case "create":
                        _StdOut.putText("<String> - Create a file");
                        break;
                    case "write":
                        _StdOut.putText("<String> <String> - Write to file");
                        break;
                    case "read":
                        _StdOut.putText("<String> - Read file");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function () {
            var date = new Date();
            //Must add plus one to month because it starts at 0
            _StdOut.putText(date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear());
        };
        //Output random location
        Shell.prototype.shellWhereAmI = function () {
            //Generate random number between 0 and 2
            var random = Math.floor((Math.random() * 3));
            var locations = ["Not outside where you should be.", "In your basement.", "In the Hancock Center"];
            //Use generated random number to output a new location to the screen everytime
            _StdOut.putText(locations[random]);
        };
        //Output random Kratos quote
        Shell.prototype.shellKratos = function () {
            //Generate random number between 0 and 3
            var random = Math.floor((Math.random() * 4));
            var quotes = ["If all those on Olympus would deny me my vengeance, then all of Olympus will die.",
                "I am what the gods have made me! ",
                "Even now, as you draw your last breath, you continue to defy me?",
                "By the gods, what have I become?"];
            _StdOut.putText(quotes[random]);
        };
        //Validates the user program input
        Shell.prototype.shellLoad = function () {
            //Cast as HTMLInputElement and then retrieve the value within the program input text area
            var input = document.getElementById("taProgramInput").value;
            var hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', ' '];
            //If input is empty, output no input
            if (input == '') {
                _StdOut.putText("No input.");
            }
            else {
                //Loop through all possible hex characters(or spaces) and check if they match the input
                var count = 0;
                for (var i = 0; i < input.length; i++) {
                    var letter = input.charAt(i);
                    for (var j = 0; j < hexChars.length; j++) {
                        //Match found in hex characters/digits
                        if (letter == hexChars[j]) {
                            count++;
                        }
                    }
                }
                //If each letter or digit is in the hex array(or spaces), then the length of count and the input should be the same
                if (count == input.length) {
                    var operation = document.getElementById("taProgramInput").value; //Op Codes
                    var index = _MemoryManager.displayBlock(operation);
                    //If all memory spaces are full then they must format 
                    if (index == -1) {
                        _StdOut.putText("Format!");
                    }
                    else {
                        if (operation.split(" ").length > 256) {
                            _StdOut.putText("Program is too large");
                        }
                        else {
                            //Write operations to memory
                            _MemoryManager.writeToMemory(index, operation); //Write to memory
                            _MemoryManager.pIDReturn(); //Increment PID
                            _MemoryManager.PID_Memory_Loc[index] = _MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]; //Display purposes
                            //Create new PCB object, initialize, and put in resident list
                            var newPCB = new TSOS.PCB();
                            newPCB.init(_MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]);
                            _cpuScheduler.residentList.push(newPCB);
                            _StdOut.putText("Program loaded. PID " + (_MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]));
                        }
                    }
                }
                else {
                    _StdOut.putText("Not Validated.");
                }
            }
        };
        //Runs program with PID
        Shell.prototype.shellRun = function (params) {
            var pID = '';
            for (var i = 0; i < params.length; i++) {
                pID += params[i];
            }
            var x = true;
            //Makes my life easier doing it this way
            for (var i = 0; i < _MemoryManager.executedPID.length; i++) {
                if (parseInt(pID) == _MemoryManager.executedPID[i]) {
                    _StdOut.putText("PID: " + pID + " does not exist");
                    x = false;
                }
            }
            if (x) {
                if (parseInt(pID) == NaN) {
                    _StdOut.putText("Please enter a numeric PID.");
                }
                else if (parseInt(pID) > _MemoryManager.PIDList.length - 1) {
                    _StdOut.putText("PID: " + pID + " does not exist");
                }
                else if (pID == '') {
                    _StdOut.putText("Please enter a PID along with the run command");
                }
                else {
                    //Change global PCB to the correct PCB from the resident list
                    for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                        if (_cpuScheduler.residentList[i].PID == parseInt(pID)) {
                            _PCB = _cpuScheduler.residentList[i];
                            break;
                        }
                    }
                    _PCB.State = "Ready";
                    _PCB.insertSingleRunRow(); //Insert a row into PCB Table
                    _PCB.displayPCB();
                    _CPU.isExecuting = true; //Run CPU
                }
            }
        };
        //Changes the status of the inner HTML
        Shell.prototype.shellStatus = function (params) {
            var word = '';
            for (var i = 0; i < params.length; i++) {
                word = word + ' ' + params[i];
            }
            document.getElementById('Status').innerHTML = 'Status: ' + word;
        };
        //Cause a test OS error
        Shell.prototype.shellError = function () {
            _Kernel.krnTrapError("Test Error");
        };
        //Clears all memory allocation
        Shell.prototype.clearMem = function () {
            if (_CPU.isExecuting) {
                _StdOut.putText("CPU is currently executing, sorry.");
            }
            else {
                _MemoryManager.clearAll();
                _cpuScheduler.clearMem();
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    //Has not been executed
                    if (_cpuScheduler.residentList[i].State == '') {
                        _MemoryManager.executedPID.push(_cpuScheduler.residentList[i].PID);
                        _cpuScheduler.residentList[i].State = "TERMINATED";
                    }
                }
            }
        };
        //Change the quantum for round robin
        Shell.prototype.quantum = function (params) {
            if (params == '') {
                _StdOut.putText("Put an Integer for the quantum");
            }
            else {
                _cpuScheduler.quantum = parseInt(params);
                _StdOut.putText("Quantum set to " + params);
            }
        };
        //Run all command
        Shell.prototype.runall = function () {
            //If it is one, just perform a single run
            var singleRunCounter = 0;
            var index = 0;
            for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                if (_cpuScheduler.residentList[i].State == '') {
                    singleRunCounter++;
                    index = i;
                }
            }
            if (singleRunCounter == 1) {
                this.shellRun(_cpuScheduler.residentList[index].PID);
            }
            else {
                var x = false;
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    if (_cpuScheduler.residentList[i].State == '') {
                        x = true;
                    }
                }
                //Check if any of the programs can be executed
                if (x) {
                    _cpuScheduler.loadReadyQueue(); //Load the ready queue
                    _cpuScheduler.RR = true; //Change cpu technique to round robin
                    _PCB.State = "Ready";
                    _cpuScheduler.displayReadyQueue();
                    _CPU.isExecuting = true; //Start the CPU
                }
                else {
                    _StdOut.putText("No programs to execute");
                }
            }
        };
        //Displays active processes
        Shell.prototype.ps = function () {
            var str = "Active Processes: ";
            //If no processes are running
            if (_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == false) {
                _StdOut.putText("No Active Processes");
            }
            else {
                if (_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == true) {
                    str += _PCB.PID + " ";
                }
                else {
                    str += _PCB.PID + " ";
                    for (var i = 0; i < _cpuScheduler.readyQueue.getSize(); i++) {
                        var tempPCB_PID = _cpuScheduler.readyQueue.q[i].PID;
                        str += tempPCB_PID + " ";
                    }
                }
                _StdOut.putText(str);
            }
        };
        //Kills active process
        Shell.prototype.kill = function (params) {
            var PID = parseInt(params); //Get PID as a integer
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_IRQ, PID)); //Call An Interrupt
        };
        //Format
        Shell.prototype.format = function () {
            _krnHardDriveDriver.krnHDDformat();
            _StdOut.putText("Hard Drive has been formatted!");
        };
        //Create file name
        Shell.prototype.createFile = function (params) {
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format HDD first!");
            }
            else if (params == '') {
                _StdOut.putText("Give a filename!");
            }
            else if (params.length > 1) {
                _StdOut.putText("Do not put space in file name!");
            }
            else if (params[0].length > 30) {
                _StdOut.putText("File name too large!");
            }
            else {
                var resultNum = _krnHardDriveDriver.krnHDDCreateFile(params.toString());
                //Full on files if return false
                if (resultNum == -1) {
                    _StdOut.putText("No more file space");
                }
                else if (resultNum == 0) {
                    _StdOut.putText("File has already been created");
                }
                else {
                    _StdOut.putText("Created file " + params);
                }
            }
        };
        //Write to file
        Shell.prototype.writeFile = function (params) {
            console.log(params);
            //Check if the HDD is formatted first
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format HDD first!");
            }
            else if (params == '') {
                _StdOut.putText("Give a filename and data!");
            }
            else if (params.length < 2) {
                _StdOut.putText("Must give filename and data params!");
            }
            else if (params[1].charAt(0) != "\"" || params[params.length - 1].charAt(params[params.length - 1].length - 1) != "\"") {
                _StdOut.putText("Data must have quotations around it");
            }
            else if (_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false) {
                _StdOut.putText("File does not exist");
            }
            else {
                _StdOut.putText("Wrote data");
                //Recreate data without quotations and also include spaces
                var data = '';
                for (var i = 1; i < params.length; i++) {
                    data += params[i];
                    if (params.length > 2 && i != params.length - 1) {
                        data += ' ';
                    }
                }
                data = data.substring(1, data.length - 1);
                _krnHardDriveDriver.krnHDDWriteFile(params[0].toString(), data);
            }
        };
        //Read file content
        Shell.prototype.readFile = function (params) {
            //Check if the HDD is formatted first
            if (!_krnHardDriveDriver.formatted) {
                _StdOut.putText("Format HDD first!");
            }
            else if (params == '') {
                _StdOut.putText("Give a filename");
            }
            else if (params.length > 1) {
                _StdOut.putText("Do not put a space in file name!");
            }
            else if (_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false) {
                _StdOut.putText("File does not exist");
            }
            else {
                _krnHardDriveDriver.krnHDDReadFile(params[0].toString());
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
