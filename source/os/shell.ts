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

            // clearmem
            sc = new ShellCommand(this.clearMem,
                                   "clearmem",
                                   " - Clear all memory allocation");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.quantum,
                                    "quantum",
                                    " - Sets the quantum for RR");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.runall,
                                    "runall",
                                    " - Run all loaded programs");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.ps,
                                    "ps",
                                     " - See all active processes");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.kill,
                                    "kill",
                                    " - Kill active process");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.format,
                                    "format",
                                    " - Format the HDD");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.createFile,
                                    "create",
                                    "<string> - Create a file");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.writeFile,
                                    "write",
                                    "<string> <string> - Write to file");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.readFile,
                                    "read",
                                    "<string> - Read a file");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.deleteFile,
                                    "delete",
                                    "<string> - Delete a file");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.listFiles,
                                    "ls",
                                    "List files stored on HDD");
            this.commandList[this.commandList.length] = sc;

            // setschedule
            sc = new ShellCommand(this.setSchedule,
                                    "setschedule",
                                    "<string> - Set the scheduling technique for the CPU");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.getSchedule,
                                    "getschedule",
                                    "Get the scheduling technique for the CPU");
            this.commandList[this.commandList.length] = sc;

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
                    case "delete":
                        _StdOut.putText("<String> - Delete file");
                        break;
                    case "ls":
                        _StdOut.putText("List files stored on HDD");
                        break;
                    case "setschedule":
                        _StdOut.putText("<String> - Set scheduling technique for cpu");
                        break;
                    case "getschedule":
                        _StdOut.putText("Get the scheduling technique for the cpu");
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
        public shellLoad(params){
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
                    var index = _MemoryManager.displayBlock(operation);
                    //If all memory spaces are full then they must format 
                    if(index == -1 && !_krnHardDriveDriver.formatted){
                        _StdOut.putText("Format the HDD!");
                    }else{
                        if(operation.split(" ").length > 256){
                            _StdOut.putText("Program is too large");
                        }else{
                            //Priority number has been inputed, check if priority scheduling technique was created
                            if(params.length >= 1 && !_cpuScheduler.priority){
                                _StdOut.putText("Must set schedule to priority");
                            }else if(params.length > 1){//Check how much is inputed
                                _StdOut.putText("Enter a number for priority");
                            }else{//Write to memory
                                //Check if no memory is available, therefore you must store in HDD
                                if(index == -1){
                                    //Create file
                                    _MemoryManager.pIDReturn(); //Increment PID
                                    var PID = _MemoryManager.PIDList[_MemoryManager.PIDList.length-1]; //Naming purposes
                                    var fileName = 'process' + PID.toString();
                                    _krnHardDriveDriver.krnHDDCreateFile(fileName);
                                    //Write to file
                                    _krnHardDriveDriver.krnHDDWriteFile(fileName, operation);
                                    //Push PCB to resident list, be sure to mark that it is in the HDD
                                    //Create new PCB object, initialize, and put in resident list
                                    var newPCB = new PCB();
                                    if(_cpuScheduler.priority){ //Init with priority
                                        newPCB.init(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1], parseInt(params[0]));
                                    }else{ //Init without priority
                                        newPCB.init(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]);   
                                    }
                                    newPCB.inHDD = true;
                                    _cpuScheduler.residentList.push(newPCB);
                                    _StdOut.putText("Program loaded. PID " + (PID));
                                }else{ //Store in memory
                                    //Write operations to memory
                                    _MemoryManager.writeToMemory(index, operation); //Write to memory
                                    _MemoryManager.pIDReturn(); //Increment PID
                                    _MemoryManager.PID_Memory_Loc[index] = _MemoryManager.PIDList[_MemoryManager.PIDList.length-1]; //Display purposes
                                    
                                    //Create new PCB object, initialize, and put in resident list
                                    var newPCB = new PCB();
                                    if(_cpuScheduler.priority){ //Init with priority
                                        newPCB.init(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1], parseInt(params[0]));
                                    }else{ //Init without priority
                                        newPCB.init(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]);   
                                    }
                                    
                                    _cpuScheduler.residentList.push(newPCB);
                                    _StdOut.putText("Program loaded. PID " + (_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]));
                                }
                            }
                        }
                    }
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
            for(var i = 0; i < _MemoryManager.executedPID.length; i++){ //Check if that program has been run before, if so it doesn't exist anymore
                if(parseInt(pID) == _MemoryManager.executedPID[i]){
                    _StdOut.putText("PID: " + pID + " does not exist");
                    x = false;
                }
            }
            if(x){
                if(parseInt(pID) == NaN){ //Checks if you entered a number
                    _StdOut.putText("Please enter a numeric PID.");
                }else if(parseInt(pID) > _MemoryManager.PIDList.length-1){ //Checks if there is a program loaded under specific PID
                    _StdOut.putText("PID: " + pID + " does not exist");
                }else if(pID == ''){ //Check if user put in a PID
                    _StdOut.putText("Please enter a PID along with the run command");
                }else{ //Run CPU if OK
                    //Change global PCB to the correct PCB from the resident list
                    for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                        if(_cpuScheduler.residentList[i].PID == parseInt(pID)){
                            _PCB = _cpuScheduler.residentList[i];
                            break;
                        }
                    }
                    _PCB.State = "Ready";
                    _PCB.insertSingleRunRow(); //Insert a row into PCB Table
                    _PCB.displayPCB();
                    //Check if the PCB is in memory, or HDD
                    if(_PCB.inHDD){
                        _Kernel.krnSwap();
                        _CPU.isExecuting = true;
                    }else{ //In memory
                        _CPU.isExecuting = true; //Run CPU
                    }
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

        //Clears all memory allocation
        public clearMem(){
            if(_CPU.isExecuting){
                _StdOut.putText("CPU is currently executing, sorry.");
            }else{
                _MemoryManager.clearAll();
                _cpuScheduler.clearMem();
                for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                    //Has not been executed
                    if(_cpuScheduler.residentList[i].State == ''){
                        _MemoryManager.executedPID.push(_cpuScheduler.residentList[i].PID);
                        _cpuScheduler.residentList[i].State = "TERMINATED";    
                    }
                }
            }
        }

        //Change the quantum for round robin
        public quantum(params){
            if(params == ''){
                _StdOut.putText("Put an Integer for the quantum");
            }else{
                _cpuScheduler.quantum = parseInt(params);
                _StdOut.putText("Quantum set to " + params);
            }
        }

        //Run all command
        public runall(){
            //Defualt to round robin if nothing was selected
            if(!_cpuScheduler.RR && !_cpuScheduler.fcfs && !_cpuScheduler.priority){
                _cpuScheduler.RR = true;
                _cpuScheduler.fcfs = false;
                _cpuScheduler.priority = false;
                _cpuScheduler.quantum = 6;
            }
            //If it is one, just perform a single run
            var singleRunCounter = 0;
            var index = 0;
            for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                if(_cpuScheduler.residentList[i].State == ''){
                    singleRunCounter++;
                    index = i;
                }
            }
            if(singleRunCounter == 1){
                this.shellRun(_cpuScheduler.residentList[index].PID);
            }else{ //Multiple programs running
                var x = false;
                for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                    if(_cpuScheduler.residentList[i].State == ''){
                        x = true;
                    }
                }
                //Check if any of the programs can be executed
                if(x){
                    _cpuScheduler.loadReadyQueue(); //Load the ready queue
                    _cpuScheduler.displayReadyQueue();
                    _CPU.isExecuting = true; //Start the CPU
                }else{
                    _StdOut.putText("No programs to execute");
                }
            }
        }

        //Displays active processes
        public ps(){
            var str = "Active Processes: ";
            //If no processes are running
            if(_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == false){
                _StdOut.putText("No Active Processes");
            }else{
                if(_cpuScheduler.readyQueue.isEmpty() && _CPU.isExecuting == true){ //Nothing in the ready queue but process is running/only one process running
                str += _PCB.PID + " ";
                }else{ //Processes in the ready queue, and one process is running as well
                    str += _PCB.PID + " ";
                    for(var i = 0; i < _cpuScheduler.readyQueue.getSize(); i++){
                        var tempPCB_PID = _cpuScheduler.readyQueue.q[i].PID;
                        str += tempPCB_PID + " ";
                    }
                }
                _StdOut.putText(str);
            }
        }

        //Kills active process
        public kill(params){
            var PID = parseInt(params); //Get PID as a integer
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_IRQ, PID)); //Call An Interrupt
        }

        //Format
        public format(){
            _krnHardDriveDriver.krnHDDformat();
            _StdOut.putText("Hard Drive has been formatted!");
        }

        //Create file name
        public createFile(params){
            if(!_krnHardDriveDriver.formatted){//Check if it is formatted first
                _StdOut.putText("Format HDD first!");
            }else if(params == ''){//Cant be empty
                _StdOut.putText("Give a filename!")
            }else if(params.length > 1){
                _StdOut.putText("Do not put space in file name!");
            }else if(params[0].length > 30){//Use 30 here because each hex character code is 2 bits
                _StdOut.putText("File name too large!");
            }else{//Create file
                var resultNum = _krnHardDriveDriver.krnHDDCreateFile(params.toString())
                //Full on files if return false
                if(resultNum == -1){
                    _StdOut.putText("No more file space");
                }else if(resultNum == 0){ //File has already been created
                    _StdOut.putText("File has already been created");
                }else{ //Succesfully created the file
                    _StdOut.putText("Created file " + params);
                }
            }
        }

        //Write to file
        public writeFile(params){
            console.log(params);
            //Check if the HDD is formatted first
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText("Format HDD first!");
            }else if(params == ''){//Check if empty
                _StdOut.putText("Give a filename and data!");
            }else if(params.length < 2){//Check if filename and data are both given
                _StdOut.putText("Must give filename and data params!");
            }else if(params[1].charAt(0) != "\"" || params[params.length-1].charAt(params[params.length-1].length-1) != "\""){//Data must be in quotations
                _StdOut.putText("Data must have quotations around it");
            }else if(_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false){//Check if file exists
                _StdOut.putText("File does not exist");
            }else{
                _StdOut.putText("Wrote data");
                //Recreate data without quotations and also include spaces
                var data = ''
                for(var i = 1; i < params.length; i++){
                    data += params[i];
                    if(params.length > 2 && i != params.length-1){
                        data += ' ';
                    }
                }
                data = data.substring(1, data.length-1);
                _krnHardDriveDriver.krnHDDWriteFile(params[0].toString(), data)
            }
        }

        //Read file content
        public readFile(params){
            //Check if the HDD is formatted first
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText("Format HDD first!");
            }else if(params == ''){//Check if empty
                _StdOut.putText("Give a filename");
            }else if(params.length > 1){//Check if filename and data are both given
                _StdOut.putText("Do not put a space in file name!");
            }else if(_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false){//Check if file exists
                _StdOut.putText("File does not exist");
            }else{//Read file contents
                var fileContents = _krnHardDriveDriver.krnHDDReadFile(params[0].toString());
                if(fileContents == ''){
                    _StdOut.putText("File is empty");
                }else{
                    _StdOut.putText(fileContents);
                }
            }
        }

        //Delete file content
        public deleteFile(params){
            //Check if the HDD is formatted first
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText("Format HDD first!");
            }else if(params == ''){//Check if empty
                _StdOut.putText("Give a filename");
            }else if(params.length > 1){//Check if filename and data are both given
                _StdOut.putText("Do not put a space in file name!");
            }else if(_krnHardDriveDriver.krnHDDCheckFileExists(params[0].toString()) == false){//Check if file exists
                _StdOut.putText("File does not exist");
            }else{//Read file contents
                _StdOut.putText("Deleted file " + params[0].toString());
                _krnHardDriveDriver.krnHDDDeleteFile(params[0].toString());
            }
        }

        //List files on HDD
        public listFiles(){
            //Check if the HDD is formatted first
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText("Format HDD first!");
            }else{
                _krnHardDriveDriver.krnHDDListFiles();
            }
        }

        //Set the schedule of the cpu scheduler
        public setSchedule(params){
            if(params == ''){
                _StdOut.putText("Must give scheduling technique!");
            }else if(params.length > 1){
                _StdOut.putText("Must only give one scheduling technique!");
            }else if(_CPU.isExecuting){
                _StdOut.putText("Can't change scheduling technique while CPU is running!");
            }else if(params[0] == 'rr'){
                _StdOut.putText("Set cpu scheduling to round robin");
                _cpuScheduler.RR = true;
                _cpuScheduler.quantum = 6;
                _cpuScheduler.fcfs = false
                _cpuScheduler.priority = false;
            }else if(params[0] == 'fcfs'){
                _StdOut.putText("Set cpu scheduling to fcfs");
                _cpuScheduler.quantum = 99999999999999;
                _cpuScheduler.RR = true;
                _cpuScheduler.fcfs = true;
                _cpuScheduler.priority = false;
            }else if(params[0] == 'priority'){
                _StdOut.putText("Set cpu scheduling to priority");
                _cpuScheduler.RR = true;
                _cpuScheduler.fcfs = false;
                _cpuScheduler.priority = true;
                _cpuScheduler.quantum = 99999999999999;
            }else{
                _StdOut.putText("That scheduling technique does not exist");
            }
        }

        //Get the scheduling technique of the CPU
        public getSchedule(){
            if(!_cpuScheduler.RR && !_cpuScheduler.fcfs && !_cpuScheduler.priority){
                _StdOut.putText("No scheduling technique has been selected");
            }else if(_cpuScheduler.fcfs){
                _StdOut.putText("First-Come First-Serve")
            }else if(_cpuScheduler.priority){
                _StdOut.putText("Priority");
            }else if(_cpuScheduler.RR){
                _StdOut.putText("Round Robin");
            }
        }
    }
}
