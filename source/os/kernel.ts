///<reference path="../globals.ts" />
///<reference path="queue.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //Load The HDD Device Driver
            this.krnTrace("Loading the Hard Drive device driver");
            _krnHardDriveDriver = new DeviceDriverHDD();
            _krnHardDriveDriver.driverEntry();
            this.krnTrace(_krnHardDriveDriver.status);


            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting && _SingleStepMode == false) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                _cpuScheduler.turnaroundTime++;
                _PCB.waitTime++;
                _CPU.cycle();
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SYSTEM_CALL_IRQ: // System Call Interrupt
                    break;
                case STEP_IRQ: //Step Interrupt
                    break;
                case STEP_TOGGLE_IRQ: //Step Toggle Interrupt
                    break;
                case KILL_IRQ: //KILL Interrupt
                    var PID = params;
                    //If nothing is running then print no active process
                    if(_CPU.isExecuting == false){
                        _StdOut.putText("No Active Processes");
                    }else if(PID == _PCB.PID){ //If the selected PID is the current PCB running/one process running
                        _CPU.endProgram();
                    }else{ //Remove process from the ready queue, clear memory blocks, etc.
                        for(var i = 0; i < _cpuScheduler.readyQueue.getSize(); i++){
                            if(_cpuScheduler.readyQueue.q[i].PID == PID){
                                _MemoryManager.clearBlock(PID); //Clear memory block
                                _MemoryManager.executedPID.push(PID); //Increment that this PID has been executed
                                _StdOut.putText("PID: " + PID + " done. Turnaround Time = " + _cpuScheduler.turnaroundTime + ". Wait Time = " + (_cpuScheduler.turnaroundTime - _cpuScheduler.readyQueue.q[i].waitTime));
                                _cpuScheduler.readyQueue.q[i].clearPCB(); //Clear the PCB
                                _cpuScheduler.readyQueue.q.splice(i, 1); //Remove this PCB from the ready queue
                                _Console.advanceLine();
                                break;
                            }
                        }
                    }
                    break;
                case CONTEXT_SWITCH_IRQ: //Context Switch Interrupt
                    _cpuScheduler.contextSwitch();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        //Perform a swap
        public krnSwap(){
            var operation = _krnHardDriveDriver.krnHDDReadFile('process' + _PCB.PID); //Get op codes from file
            _krnHardDriveDriver.krnHDDDeleteFile('process' + _PCB.PID); //Delete the file
            var index = _MemoryManager.displayBlock(operation); //If this displays -1, then there is no open memory(swapping needed)
            if(index == -1){//Swapping needed(Always swap to 0)
                var operationMemArray = _MemoryManager.getOperation(0); //Array of op codes in memory(Need to convert to string)
                var operationMem = '';
                for(var i = 0; i < operationMemArray.length; i++){
                    operationMem += operationMemArray[i];
                    if(i != operationMemArray.length-1){
                        operationMem += ' '; //Spaces needed later on when converting back to array
                    }
                }
                //Create and write file for that process going into the HDD out of memory
                _krnHardDriveDriver.krnHDDCreateFile('process' + _MemoryManager.PID_Memory_Loc[0].toString());
                _krnHardDriveDriver.krnHDDWriteFile('process' + _MemoryManager.PID_Memory_Loc[0].toString(), operationMemArray.join(" "));

                //Change PCB of file going into HDD to notify that it is located there
                for(var i = 0; i < _cpuScheduler.residentList.length; i++){
                    if(_cpuScheduler.residentList[i].PID == _MemoryManager.PID_Memory_Loc[0]){
                        _cpuScheduler.residentList[i].inHDD = true;
                    }
                }
                _MemoryManager.writeToMemory(0, operation);
                _MemoryManager.PID_Memory_Loc[0] = _PCB.PID; //Display purposes
                _PCB.inHDD = false;
            }else{//Write to memory and execute
                //Write operations to memory
                _MemoryManager.writeToMemory(index, operation); //Write to memory
                _MemoryManager.PID_Memory_Loc[index] = _PCB.PID; //Display purposes
                _PCB.inHDD = false;
            }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _StdOut.clearScreen(); //Clear the console
            
            //Turn the background to blue
            _DrawingContext.beginPath();
            _DrawingContext.rect(0,0,500,500);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fill();

            //Write BSOD message
            _DrawingContext.fillStyle = "white";
            _DrawingContext.font = "30px Verdana";
            _DrawingContext.fillText("BLUE SCREEN OF DEATH",50,100);
            _DrawingContext.font = "10px Verdana";
            _DrawingContext.fillText("Congrats, you managed to destroy what I worked so hard on...",50,150);
            this.krnShutdown();
        }
    }
}
