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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        //memorySpace is an array to indicate which 255 spots of memory are free
        //Memory is an array but only location 0000 is here, temporary...
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, PID, IR) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (PID === void 0) { PID = -1; }
            if (IR === void 0) { IR = ''; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.PID = PID;
            this.IR = IR;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var index = _MemoryManager.memoryIndex(this.PID); //Get memory block location for operation
            var operation = _MemoryManager.getOperation(index); //Array of op codes;
            this.executeCode(operation);
        };
        Cpu.prototype.executeCode = function (operation) {
            if (_MemoryManager.operationIndex + 1 >= operation.length) {
                this.endProgram();
            }
            else {
                var i = _MemoryManager.operationIndex;
                console.log(operation[i]);
                if (operation[i] == 'A9') {
                    this.loadAccumulator(operation[i + 1]);
                    _MemoryManager.operationIndex += 2;
                }
                else if (operation[i] == 'A2') {
                    this.loadXRegister(operation[i + 1]);
                    _MemoryManager.operationIndex += 2;
                }
                else if (operation[i] == 'A0') {
                    this.loadYRegister(operation[i + 1]);
                    _MemoryManager.operationIndex += 2;
                }
                else if (operation[i] == '8D') {
                    this.storeAccumulator(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == 'AE') {
                    this.loadXRegisterMem(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == 'AC') {
                    this.loadYRegisterMem(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == '6D') {
                    this.addCarry(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == 'EC') {
                    this.compareByte(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == 'D0') {
                    this.branchIfNotEqual(operation[i + 1], _PCB.getLimit(this.PID));
                    _MemoryManager.operationIndex += 1;
                }
                else if (operation[i] == 'FF') {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, '')); //Call An Interrupt
                    _MemoryManager.operationIndex += 1;
                }
                else if (operation[i] == 'EE') {
                    this.incrementByteValue(_MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]));
                    _MemoryManager.operationIndex += 3;
                }
                else if (operation[i] == '00') {
                    this.endProgram();
                }
                _PCB.setIR(operation[i]); //Change IR in PCB
                _PCB.displayPCB('Running'); //Change State in PCB and Update
                this.updateCpuTable(); //Update CPU Table
            }
        };
        Cpu.prototype.endProgram = function () {
            _MemoryManager.operationIndex = 0;
            //Clear CPU Table
            var table = document.getElementById("cpuTable");
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
            //Clear specific memory location  
            _MemoryManager.clearBlock(this.PID); //Clear the block of memory
            _MemoryManager.executedPID.push(this.PID); //Past PID's
            _StdOut.putText("PID: " + this.PID + " done.");
            //Clear PCB
            _PCB.clearPCB();
            this.PID = -1; //Change back to normal
            //Turn Single Step Off if On
            document.getElementById("btnSingleStepToggle").value = "Single Step: Off";
            document.getElementById("btnStep").disabled = true;
            _SingleStepMode = false;
            //End CPU Cycle here
            this.isExecuting = false;
        };
        //Loads a constant in the accumulator(OP Code A9)
        Cpu.prototype.loadAccumulator = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                this.IR = 'A9'; //Change IR
                this.Acc = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in accumulator(Hex)                
            }
        };
        //Loads a constant in X register(OP Code A2)
        Cpu.prototype.loadXRegister = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                this.IR = 'A2'; //Change IR
                this.Xreg = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in X Register(Hex)
            }
        };
        //Loads a constant in the Y register(OP Code A0)
        Cpu.prototype.loadYRegister = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                this.IR = 'A0'; //Change IR
                this.Yreg = _MemoryManager.hexToDec(parseInt(constant)); //Store constant in Y Register(Hex)
            }
        };
        //Store accumulator into specific little endian memory location(OP Code 8D)
        Cpu.prototype.storeAccumulator = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                this.IR = '8D'; //Change IR
                _MemoryManager.writeOPCode(this.Acc, location); //Write Op code into location
            }
        };
        //Loads X register from memory(OP Code AE)
        Cpu.prototype.loadXRegisterMem = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                this.IR = 'AE'; //Change IR
                this.Xreg = _MemoryManager.getVariable(location); //Get variable from that memory address
            }
        };
        //Loads Y register from memory(OP Code AC)
        Cpu.prototype.loadYRegisterMem = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                this.IR = 'AC'; //Change IR
                this.Yreg = _MemoryManager.getVariable(location); //Get variable from that memory address
            }
        };
        //Adds contents of an address to the accumulator(OP Code 6D)
        Cpu.prototype.addCarry = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                this.IR = '6D'; //Change IR
                this.Acc += _MemoryManager.getVariable(location);
            }
        };
        //Compare a byte in memory to the X reg
        Cpu.prototype.compareByte = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                this.IR = 'EC'; //Change IR
                var byte = _MemoryManager.getVariable(location); //Byte in memory
                if (parseInt(byte) != this.Xreg) {
                    this.Zflag = 0; //Change z flag if not equal
                }
                else {
                    this.Zflag = 1;
                }
            }
        };
        //Branch n bytes if Z flag = 0(Op Code D0)
        Cpu.prototype.branchIfNotEqual = function (distance, limit) {
            if (distance != '') {
                var distance = _MemoryManager.hexToDec(distance);
                console.log(distance);
                console.log(limit);
                if (this.Zflag == 0) {
                    if (this.PC + distance > limit) {
                        var index = this.PC + distance;
                        index = index - limit;
                        this.PC = index;
                        _MemoryManager.operationIndex = index + 1;
                    }
                    else {
                        this.PC += 2 + distance;
                        this.IR = 'D0';
                        _MemoryManager.operationIndex += distance + 1; //Indexing reasons, must add one
                    }
                }
                else {
                    this.PC += 2;
                    this.IR = 'D0';
                    _MemoryManager.operationIndex += 1;
                }
            }
        };
        //System Call(Op Code FF)
        Cpu.prototype.SystemCall = function () {
            if (this.Xreg == 1) {
                this.PC += 1;
                this.IR = 'FF';
                _StdOut.putText(this.Yreg + "");
            }
            // }else if(this.Xreg == 2){ //Print out 00 terminated string located at address stored in Y reg
            //     var location = 
            // }
        };
        //Increment value of a byte in location(Op Code EE)
        Cpu.prototype.incrementByteValue = function (location) {
            if (location != '') {
                this.PC += 3;
                this.IR = 'EE';
                var byte = _MemoryManager.getVariable(location);
                _MemoryManager.writeOPCode(_MemoryManager.hexToDec(byte + 1), location);
            }
        };
        //Update CPU Table
        Cpu.prototype.updateCpuTable = function () {
            var table = "";
            table += "<td>" + this.PC + "</td>";
            table += "<td>" + this.Acc + "</td>";
            table += "<td>" + this.IR + "</td>";
            table += "<td>" + this.Xreg + "</td>";
            table += "<td>" + this.Yreg + "</td>";
            table += "<td>" + this.Zflag + "</td>";
            document.getElementById("cpuTableBody").innerHTML = table;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
