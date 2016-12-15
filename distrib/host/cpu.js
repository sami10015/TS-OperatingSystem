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
            // Do the real work here. Be sure to set this.isExecuting appropriately
            //Change CPU based on current PCB, which is changed via cpuScheduler
            this.updateCpuTable();
            _PCB.State = "Running";
            //Get specific memory block for operation
            var index = _MemoryManager.memoryIndex(this.PID); //Get memory block location for operation
            var operation = _MemoryManager.getOperation(index); //Array of op codes;
            this.executeCode(operation);
        };
        Cpu.prototype.executeCode = function (operation) {
            if (this.PC + 1 >= operation.length) {
                this.endProgram();
            }
            else {
                var i = this.PC;
                if (operation[i] == 'A9') {
                    this.loadAccumulator(operation[i + 1]);
                }
                else if (operation[i] == 'AD') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.loadAccumulatorMem(location);
                }
                else if (operation[i] == 'A2') {
                    this.loadXRegister(operation[i + 1]);
                }
                else if (operation[i] == 'A0') {
                    this.loadYRegister(operation[i + 1]);
                }
                else if (operation[i] == '8D') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.storeAccumulator(location);
                }
                else if (operation[i] == 'AE') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.loadXRegisterMem(location);
                }
                else if (operation[i] == 'AC') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.loadYRegisterMem(location);
                }
                else if (operation[i] == '6D') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.addCarry(location);
                }
                else if (operation[i] == 'EC') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.compareByte(location);
                }
                else if (operation[i] == 'D0') {
                    this.branchIfNotEqual(operation[i + 1], _PCB.Limit, operation);
                }
                else if (operation[i] == 'FF') {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, '')); //Call An Interrupt
                    this.SystemCall();
                }
                else if (operation[i] == 'EE') {
                    var location = _MemoryManager.littleEndianAddress(operation[i + 1], operation[i + 2]);
                    location += _PCB.Base;
                    this.incrementByteValue(location);
                }
                else if (operation[i] == '00') {
                    this.endProgram();
                }
                //Display purposes
                if (_PCB.State != "TERMINATED") {
                    _PCB.displayPCB();
                }
                //debugger;
                _MemoryManager.updateBlock(_PCB.PID); //Update Memory Table
                _PCB.setIR(operation[i]); //Change IR in PCB
                this.updateCpuTable();
                this.displayCpuTable(); //Update CPU Table Display
                //Check cpu scheduler for possible context switches, don't perform context switches if nothing is left in the ready queue
                if (_cpuScheduler.RR && _cpuScheduler.readyQueue.isEmpty() == false) {
                    _cpuScheduler.checkCount();
                }
            }
        };
        //End the program
        Cpu.prototype.endProgram = function () {
            //Clear CPU Table
            var table = document.getElementById("cpuTable");
            table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
            //Clear specific memory location 
            _MemoryManager.clearBlock(this.PID); //Clear the block of memory
            _MemoryManager.executedPID.push(this.PID); //Past PID's
            _StdOut.putText("PID: " + this.PID + " done. Turnaround Time = " + _cpuScheduler.turnaroundTime + ". Wait Time = " + (_cpuScheduler.turnaroundTime - _PCB.waitTime));
            _Console.advanceLine();
            //Clear PCB, change state to terminated, and turn isExecuting to false
            _PCB.clearPCB();
            //End CPU Cycle here depending on type of command(single run, or runall)
            if (_cpuScheduler.count != _cpuScheduler.quantum) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event')); //Call An Interrupt
            }
            if (!_cpuScheduler.RR && !_cpuScheduler.fcfs) {
                this.isExecuting = false;
                _cpuScheduler.turnaroundTime = 0; //Reset TT
                _Console.putText(_OsShell.promptStr);
                //Turn Single Step Off if On
                document.getElementById("btnSingleStepToggle").value = "Single Step: Off";
                document.getElementById("btnStep").disabled = true;
                _SingleStepMode = false;
            }
            debugger;
        };
        //Loads a constant in the accumulator(OP Code A9)
        Cpu.prototype.loadAccumulator = function (constant) {
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A9'; //Change IR
            _PCB.AC = _MemoryManager.hexToDec(constant); //Store constant in accumulator(Hex)                
        };
        //Store accumulator into memory(OP Code AD)
        Cpu.prototype.loadAccumulatorMem = function (location) {
            _PCB.PC += 3;
            _PCB.IR = 'AD';
            _PCB.AC = _MemoryManager.getVariable(location);
        };
        //Loads a constant in X register(OP Code A2)
        Cpu.prototype.loadXRegister = function (constant) {
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A2'; //Change IR
            _PCB.X = _MemoryManager.hexToDec(constant); //Store constant in X Register(Hex)
        };
        //Loads a constant in the Y register(OP Code A0)
        Cpu.prototype.loadYRegister = function (constant) {
            _PCB.PC += 2; //Add to program counter
            _PCB.IR = 'A0'; //Change IR
            _PCB.Y = _MemoryManager.hexToDec(constant); //Store constant in Y Register(Hex)
        };
        //Store accumulator into specific little endian memory location(OP Code 8D)
        Cpu.prototype.storeAccumulator = function (memoryLoc) {
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = '8D'; //Change IR
            _MemoryManager.writeOPCode(_PCB.AC, memoryLoc); //Write Op code into location
        };
        //Loads X register from memory(OP Code AE)
        Cpu.prototype.loadXRegisterMem = function (location) {
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'AE'; //Change IR
            _PCB.X = _MemoryManager.getVariable(location); //Get variable from that memory address
        };
        //Loads Y register from memory(OP Code AC)
        Cpu.prototype.loadYRegisterMem = function (location) {
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'AC'; //Change IR
            _PCB.Y = _MemoryManager.getVariable(location); //Get variable from that memory address
        };
        //Adds contents of an address to the accumulator(OP Code 6D)
        Cpu.prototype.addCarry = function (location) {
            debugger;
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = '6D'; //Change IR
            var variable = _MemoryManager.getVariable(location);
            _PCB.AC += parseInt(variable);
        };
        //Compare a byte in memory to the X reg(Op Code EC)
        Cpu.prototype.compareByte = function (location) {
            _PCB.PC += 3; //Add to program counter
            _PCB.IR = 'EC'; //Change IR
            var byte = _MemoryManager.getVariable(location); //Byte in memory
            if (parseInt(byte) != _PCB.X) {
                _PCB.Z = 0; //Change z flag if not equal
            }
            else {
                _PCB.Z = 1;
            }
        };
        //Branch n bytes if Z flag = 0(Op Code D0)
        Cpu.prototype.branchIfNotEqual = function (distance, limit, operation) {
            var distance = _MemoryManager.hexToDec(distance);
            var base = _PCB.Base;
            if (_PCB.Z == 0) {
                if (_PCB.PC + distance + base > limit) {
                    _PCB.PC = (_PCB.PC + distance + base) - limit + 2;
                    _PCB.IR = operation[_PCB.PC];
                }
                else {
                    _PCB.PC = _PCB.PC + distance + 2; //Increment to branch
                    _PCB.IR = operation[_PCB.PC]; //Change IR
                }
            }
            else {
                _PCB.PC += 2;
                _PCB.IR = 'D0';
            }
        };
        //System Call(Op Code FF)
        Cpu.prototype.SystemCall = function () {
            if (_PCB.X == 1) {
                _PCB.PC += 1;
                _PCB.IR = 'FF';
                _StdOut.putText(_PCB.Y + "");
                _Console.advanceLine();
            }
            else if (_PCB.X == 2) {
                var terminated = false;
                var location = _PCB.Y + _PCB.Base;
                var str = "";
                while (!terminated) {
                    var charNum = _MemoryManager.getVariable(location);
                    if (charNum == 0) {
                        terminated = true;
                        break;
                    }
                    else {
                        str += String.fromCharCode(_MemoryManager.hexToDec(charNum));
                        location++;
                    }
                }
                _StdOut.putText(str);
                _Console.advanceLine();
                _PCB.PC += 1;
                _PCB.IR = 'FF';
            }
        };
        //Increment value of a byte in location(Op Code EE)
        Cpu.prototype.incrementByteValue = function (location) {
            _PCB.PC += 3;
            _PCB.IR = 'EE';
            var byte = _MemoryManager.getVariable(location);
            _MemoryManager.writeOPCode(_MemoryManager.hexToDec(byte + 1), location);
        };
        //Update CPU Table, used mainly when PCB is changed and updated via CPU Scheduler
        Cpu.prototype.updateCpuTable = function () {
            this.PID = _PCB.PID;
            this.PC = _PCB.PC;
            this.Acc = _PCB.AC;
            this.Xreg = _PCB.X;
            this.Yreg = _PCB.Y;
            this.Zflag = _PCB.Z;
            this.IR = _PCB.IR;
        };
        //Change CPU Table Display
        Cpu.prototype.displayCpuTable = function () {
            var table = "";
            table += "<td>" + (this.PC + _PCB.Base) + "</td>";
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
