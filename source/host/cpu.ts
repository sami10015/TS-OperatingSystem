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
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var index = _MemoryManager.memoryIndex(this.PID); //Get memory block location for operation
            var operation = _MemoryManager.getOperation(index); //Array of op codes;
            this.executeCode(operation);           
        }

        public executeCode(operation){
            if(_MemoryManager.operationIndex+1 >= operation.length){ //Save from Index Error
                this.endProgram();
            }else{
                var i = _MemoryManager.operationIndex;
                console.log(operation[i]);
                if(operation[i] == 'A9'){ //Load Accumulator
                    this.loadAccumulator(operation[i+1]);
                    _MemoryManager.operationIndex+=2;
                }else if(operation[i] == 'A2'){ //Load X Register
                    this.loadXRegister(operation[i+1]);
                    _MemoryManager.operationIndex+=2;
                }else if(operation[i] == 'A0'){ //Load Y Register
                    this.loadYRegister(operation[i+1]);
                    _MemoryManager.operationIndex+=2;
                }else if(operation[i] == '8D'){ //Store accumulator into memory
                    this.storeAccumulator(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex+=3;
                }else if(operation[i] == 'AE'){ //Load X register from memory
                    this.loadXRegisterMem(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex+=3;
                }else if(operation[i] == 'AC'){ //Load Y register from memory
                    this.loadYRegisterMem(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex+=3;
                }else if(operation[i] == '6D'){ //Add carry to accumulator
                    this.addCarry(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex+=3;
                }else if(operation[i] == 'EC'){ //Compare a byte to X reg, set flag if equal
                    this.compareByte(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex+=3;
                }else if(operation[i] == 'D0'){ //Branch n bytes if Z flag is 0
                    this.branchIfNotEqual(operation[i+1],_PCB.getLimit(this.PID));
                    _MemoryManager.operationIndex += 1;
                }else if(operation[i] == 'FF'){ //System Call
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, ''));
                    //this.SystemCall();
                    _MemoryManager.operationIndex += 1;
                }else if(operation[i] == 'EE'){ //Increment a value of a byte
                    this.incrementByteValue(_MemoryManager.littleEndianAddress(operation[i+1],operation[i+2]));
                    _MemoryManager.operationIndex += 3;
                }else if(operation[i] == '00'){ //Break
                    this.endProgram();
                }
                _PCB.setIR(operation[i]); //Change IR in PCB
                _PCB.displayPCB('Running'); //Change State in PCB and Update
                this.updateCpuTable(); //Update CPU Table
            }
        }

        public endProgram(){
            _MemoryManager.operationIndex = 0;
            //Clear CPU Table
            var table = (<HTMLInputElement>document.getElementById("cpuTable"));
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
            //Clear specific memory location  
            _MemoryManager.clearBlock(this.PID); //Clear the block of memory
            _MemoryManager.executedPID.push(this.PID); //Past PID's
            _StdOut.putText("PID: " + this.PID + " done."); 
            //Clear PCB
            _PCB.clearPCB();              
            this.PID = -1; //Change back to normal
            //Turn Single Step Off if On
            (<HTMLButtonElement>document.getElementById("btnSingleStepToggle")).value = "Single Step: Off";
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
            _SingleStepMode = false; 
            //End CPU Cycle here
            this.isExecuting = false;
        }

        //Loads a constant in the accumulator(OP Code A9)
        public loadAccumulator(constant){
            if(constant != ''){ //Check that there is a constant to save
                this.PC += 2; //Add to program counter
                this.IR = 'A9' //Change IR
                this.Acc = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in accumulator(Hex)                
            } 
        }

        //Loads a constant in X register(OP Code A2)
        public loadXRegister(constant){
            if(constant != ''){ //Check that there is a constant to save
                this.PC += 2; //Add to program counter
                this.IR = 'A2' //Change IR
                this.Xreg = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in X Register(Hex)
            } 
        }

        //Loads a constant in the Y register(OP Code A0)
        public loadYRegister(constant){
            if(constant != ''){ //Check that there is a constant to save
                this.PC += 2; //Add to program counter
                this.IR = 'A0' //Change IR
                this.Yreg = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in Y Register(Hex)
            } 
        }

        //Store accumulator into specific little endian memory location(OP Code 8D)
        public storeAccumulator(location){
            if(location != ''){//Check that there is a location to store the accumulator in
                this.PC += 3; //Add to program counter
                this.IR = '8D' //Change IR
                _MemoryManager.writeOPCode(this.Acc, location); //Write Op code into location
            }
        }

        //Loads X register from memory(OP Code AE)
        public loadXRegisterMem(location){
            if(location != ''){
                this.PC += 3; //Add to program counter
                this.IR = 'AE' //Change IR
                this.Xreg = _MemoryManager.getVariable(location); //Get variable from that memory address
            }
        }

        //Loads Y register from memory(OP Code AC)
        public loadYRegisterMem(location){
            if(location != ''){
                this.PC += 3; //Add to program counter
                this.IR = 'AC' //Change IR
                this.Yreg = _MemoryManager.getVariable(location); //Get variable from that memory address
            }
        }

        //Adds contents of an address to the accumulator(OP Code 6D)
        public addCarry(location){
            if(location != ''){
                this.PC += 3; //Add to program counter
                this.IR = '6D' //Change IR
                this.Acc += _MemoryManager.getVariable(location);
            }
        }

        //Compare a byte in memory to the X reg
        public compareByte(location){
            if(location != ''){
                this.PC += 3; //Add to program counter
                this.IR = 'EC' //Change IR
                var byte = _MemoryManager.getVariable(location); //Byte in memory
                if(parseInt(byte) != this.Xreg){
                    this.Zflag = 0; //Change z flag if not equal
                }else{ //Change z flag if equal
                    this.Zflag = 1;
                }
            }
        }

        //Branch n bytes if Z flag = 0(Op Code D0)
        public branchIfNotEqual(distance, limit){
            if(distance != ''){
                var distance = _MemoryManager.hexToDec(distance);
                console.log(distance);
                console.log(limit);
                if(this.Zflag == 0){
                    if(this.PC + distance > limit){
                        var newIndex = this.PC+distance-limit; //Subtract one for index
                        console.log(newIndex);
                        _MemoryManager.operationIndex = newIndex;
                        this.PC = newIndex+1;
                    }
                }else{
                    this.PC += 2;
                    this.IR = 'D0'
                }
            }
        }

        //System Call(Op Code FF)
        public SystemCall(){
            if(this.Xreg == 1){ //Print Y Reg if X reg is 1
                this.PC += 1;
                this.IR = 'FF';
                _StdOut.putText(this.Yreg + "");
            }
        }

        //Increment value of a byte in location(Op Code EE)
        public incrementByteValue(location){
            if(location != ''){
                this.PC += 3;
                var byte = _MemoryManager.getVariable(location);
                _MemoryManager.writeOPCode(_MemoryManager.hexToDec(byte+1), location);
            }
        }

        //Update CPU Table
        public updateCpuTable(){
            var table = "";
            table += "<td>" + this.PC + "</td>";
            table += "<td>" + this.Acc + "</td>";
            table += "<td>" + this.IR + "</td>";
            table += "<td>" + this.Xreg + "</td>";
            table += "<td>" + this.Yreg + "</td>";
            table += "<td>" + this.Zflag + "</td>";
            document.getElementById("cpuTableBody").innerHTML = table;
        }
    }
}
