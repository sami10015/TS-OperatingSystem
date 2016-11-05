///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {
        //memorySpace is an array to indicate which 255 spots of memory are free
        //Memory is an array but only location 0000 is here, temporary...
        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public PID: number = -1,
                    public IR: string = '') {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');  
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately

            //Change CPU based on current PCB, which is changed via cpuScheduler
            this.updateCpuTable();

            //Get specific memory block for operation
            var index = _MemoryManager.memoryIndex(this.PID); //Get memory block location for operation
            var operation = _MemoryManager.getOperation(index); //Array of op codes;
            this.executeCode(operation);           
        }

        public executeCode(operation){
            if(this.PC+1 >= operation.length){ //Save from Index Error
                this.endProgram();
            }else{
                var i = this.PC;
                if(operation[i] == 'A9'){ //Load Accumulator
                    this.loadAccumulator(operation[i+1]);
                }else if(operation[i] == 'AD'){
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.loadAccumulatorMem(location);
                }else if(operation[i] == 'A2'){ //Load X Register
                    this.loadXRegister(operation[i+1]);
                }else if(operation[i] == 'A0'){ //Load Y Register
                    this.loadYRegister(operation[i+1]);
                }else if(operation[i] == '8D'){ //Store accumulator into memory
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.storeAccumulator(location);
                }else if(operation[i] == 'AE'){ //Load X register from memory
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.loadXRegisterMem(location);
                }else if(operation[i] == 'AC'){ //Load Y register from memory
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.loadYRegisterMem(location);
                }else if(operation[i] == '6D'){ //Add carry to accumulator
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.addCarry(location);
                }else if(operation[i] == 'EC'){ //Compare a byte to X reg, set flag if equal
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.compareByte(location);
                }else if(operation[i] == 'D0'){ //Branch n bytes if Z flag is 0
                    this.branchIfNotEqual(operation[i+1],_PCB.Limit, operation);
                }else if(operation[i] == 'FF'){ //System Call
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, '')); //Call An Interrupt
                    this.SystemCall();
                }else if(operation[i] == 'EE'){ //Increment a value of a byte
                    var location = _MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]);
                    location += _PCB.Base;
                    this.incrementByteValue(location);
                }else if(operation[i] == '00'){ //Break 
                    this.endProgram();  
                }

                // if(operation[i] == '00' || operation[i] == operation[operation.length-1]){
                //     _PCB.clearPCB();
                // }else{
                //     //This always runs
                //     _PCB.displayPCB('Running');
                // }
                _PCB.displayPCB();
                //_cpuScheduler.displayReadyQueue();
                _MemoryManager.updateBlock(_PCB.PID); //Update Memory Table
                _PCB.setIR(operation[i]); //Change IR in PCB
                this.updateCpuTable();
                this.displayCpuTable(); //Update CPU Table Display

                 //Check cpu scheduler for possible context switches, don't perform context switches if nothing is left in the ready queue
                if(_cpuScheduler.RR && _cpuScheduler.readyQueue.isEmpty() == false){
                    _cpuScheduler.checkCount();
                }
            }
        }

        //End the program
        public endProgram(){
            //Clear CPU Table
            var table = (<HTMLInputElement>document.getElementById("cpuTable"));
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
            //Clear specific memory location 
            _MemoryManager.clearBlock(this.PID); //Clear the block of memory
            _MemoryManager.executedPID.push(this.PID); //Past PID's
            _StdOut.putText("PID: " + this.PID + " done. Turnaround Time = " + _cpuScheduler.turnaroundTime + ". Wait Time = " + (_cpuScheduler.turnaroundTime - _PCB.waitTime));
            _Console.advanceLine();
            //this.PID = -1; //Change back to normal 
            //Clear PCB, change state to terminated, and turn isExecuting to false
            _PCB.clearPCB();              
            
            //End CPU Cycle here depending on type of command(single run, or runall)
            if(_cpuScheduler.count != _cpuScheduler.quantum){//If the count isn't at the quantum yet but there are programs still running
                _cpuScheduler.contextSwitch();
            }
            if(!_cpuScheduler.RR){//Single run
                this.isExecuting = false;
                _Console.putText(_OsShell.promptStr);
                //Turn Single Step Off if On
                (<HTMLButtonElement>document.getElementById("btnSingleStepToggle")).value = "Single Step: Off";
                (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
                _SingleStepMode = false;
            }
        }

        //Loads a constant in the accumulator(OP Code A9)
        public loadAccumulator(constant){
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A9' //Change IR
            _PCB.AC = _MemoryManager.hexToDec(constant); //Store constant in accumulator(Hex)                
        }

        //Store accumulator into memory(OP Code AD)
        public loadAccumulatorMem(location){
            _PCB.PC += 3;
            _PCB.IR = 'AD';
            _PCB.AC = _MemoryManager.getVariable(location);
        }

        //Loads a constant in X register(OP Code A2)
        public loadXRegister(constant){
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A2' //Change IR
            _PCB.X = _MemoryManager.hexToDec(constant); //Store constant in X Register(Hex)
        }

        //Loads a constant in the Y register(OP Code A0)
        public loadYRegister(constant){
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A0' //Change IR
            _PCB.Y = _MemoryManager.hexToDec(constant); //Store constant in Y Register(Hex)
        }

        //Store accumulator into specific little endian memory location(OP Code 8D)
        public storeAccumulator(memoryLoc){
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = '8D' //Change IR
            _MemoryManager.writeOPCode(_PCB.AC, memoryLoc); //Write Op code into location
        }

        //Loads X register from memory(OP Code AE)
        public loadXRegisterMem(location){
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'AE' //Change IR
            _PCB.X = _MemoryManager.getVariable(location); //Get variable from that memory address
        }

        //Loads Y register from memory(OP Code AC)
        public loadYRegisterMem(location){
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'AC' //Change IR
            _PCB.Y = _MemoryManager.getVariable(location); //Get variable from that memory address
        }

        //Adds contents of an address to the accumulator(OP Code 6D)
        public addCarry(location){
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = '6D' //Change IR
            _PCB.AC += _MemoryManager.getVariable(location);
        }

        //Compare a byte in memory to the X reg(Op Code EC)
        public compareByte(location){
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'EC' //Change IR
            var byte = _MemoryManager.getVariable(location); //Byte in memory
            if(parseInt(byte) != _PCB.X){
                _PCB.Z = 0; //Change z flag if not equal
            }else{ //Change z flag if equal
                _PCB.Z = 1;
            }
        }

        //Branch n bytes if Z flag = 0(Op Code D0)
        public branchIfNotEqual(distance, limit, operation){
            var distance = _MemoryManager.hexToDec(distance);
            var base = _PCB.Base;
            if(_PCB.Z == 0){
                if(_PCB.PC + distance + base > limit){ //Causes loop to start from behind
                    _PCB.PC = (_PCB.PC+distance+base) - limit + 2;
                    _PCB.IR = operation[_PCB.PC];
                }else{ //Branch
                    _PCB.PC = _PCB.PC + distance + 2; //Increment to branch
                    _PCB.IR = operation[_PCB.PC]; //Change IR
                }
            }else{
                _PCB.PC += 2;
                _PCB.IR = 'D0';
            }
        }

        //System Call(Op Code FF)
        public SystemCall(){ 
            if(_PCB.X == 1){ //Print Y Reg if X reg is 1
                _PCB.PC += 1;
                _PCB.IR = 'FF';
                _StdOut.putText(_PCB.Y + "");
                _Console.advanceLine();
            }else if(_PCB.X == 2){ //Print out 00 terminated string located at address stored in Y reg
                var terminated = false;
                var location = _PCB.Y+_PCB.Base;
                var str = "";
                while(!terminated){
                    var charNum = _MemoryManager.getVariable(location);
                    if(charNum == 0){
                        terminated = true;
                        break;
                    }else{
                        str += String.fromCharCode(_MemoryManager.hexToDec(charNum));
                        location++;
                    }
                }
                _StdOut.putText(str);
                _Console.advanceLine();
                _PCB.PC += 1;
                _PCB.IR = 'FF';
            }
        }

        //Increment value of a byte in location(Op Code EE)
        public incrementByteValue(location){
            _PCB.PC += 3;
            _PCB.IR = 'EE';
            var byte = _MemoryManager.getVariable(location);
            _MemoryManager.writeOPCode(_MemoryManager.hexToDec(byte+1), location);
        }

        //Update CPU Table, used mainly when PCB is changed and updated via CPU Scheduler
        public updateCpuTable(){
            this.PID = _PCB.PID;
            this.PC = _PCB.PC;
            this.Acc = _PCB.AC;
            this.Xreg = _PCB.X;
            this.Yreg = _PCB.Y;
            this.Zflag = _PCB.Z;
            this.IR = _PCB.IR;
        }

        //Change CPU Table Display
        public displayCpuTable(){
            var table = "";
            table += "<td>" + (this.PC+_PCB.Base) + "</td>";
            table += "<td>" + this.Acc + "</td>";
            table += "<td>" + this.IR + "</td>";
            table += "<td>" + this.Xreg + "</td>";
            table += "<td>" + this.Yreg + "</td>";
            table += "<td>" + this.Zflag + "</td>";
            document.getElementById("cpuTableBody").innerHTML = table;
        }
    }
}
