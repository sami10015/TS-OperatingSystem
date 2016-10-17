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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, PID) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (PID === void 0) { PID = -1; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.PID = PID;
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
            var input = document.getElementById("taProgramInput").value; //Op Codes
            var index = _MemoryManager.memoryIndex(this.PID); //Get memory block location for operation
            var operation = _Memory.read(index); //Array of op codes
            if (this.PID != -1) {
                this.isExecuting = true;
                for (var i = 0; i < operation.length; i++) {
                    if (operation[i] == 'A9') {
                        this.loadAccumulator(operation[i + 1]);
                        i + 1;
                    }
                    else if (operation[i] == 'A2') {
                        this.loadXRegister(operation[i + 1]);
                        i + 1;
                    }
                    else if (operation[i] == 'A0') {
                        this.loadYRegister(operation[i + 1]);
                        i + 1;
                    }
                    else if (operation[i] == '8D') {
                    }
                    else if (operation[i] == 'AE') {
                    }
                    else if (operation[i] == 'AC') {
                    }
                    _PCB.displayPCB('Running');
                }
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
                this.isExecuting = false;
            }
            this.PID = -1; //Change back to normal            
        };
        //Loads a constant in the accumulator(OP Code A9)
        Cpu.prototype.loadAccumulator = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                //Change HTML CPU Display
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A9'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[1].innerHTML = constant; //Acc
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Acc = parseInt(constant); //Store constant in accumulator
                this.isExecuting = false; //CPU Cycle Done
            }
        };
        //Loads a constant in X register(OP Code A2)
        Cpu.prototype.loadXRegister = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                //Change HTML CPU Display
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A2'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[3].innerHTML = constant; //ACC
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Xreg = parseInt(constant); //Store constant in X Register
                this.isExecuting = false; //CPU Cycle Done
            }
        };
        //Loads a constant in the Y register(OP Code A0)
        Cpu.prototype.loadYRegister = function (constant) {
            if (constant != '') {
                this.PC += 2; //Add to program counter
                //Change HTML CPU Display
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A0'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[4].innerHTML = constant; //ACC
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Xreg = parseInt(constant); //Store constant in Y Register
                this.isExecuting = false; //CPU Cycle Done
            }
        };
        //Store accumulator into specific memory location(OP Code 8D)
        Cpu.prototype.storeAccumulator = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                //Change HTML CPU Display
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '8D'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
            }
        };
        //Loads X register from memory(OP Code AE)
        Cpu.prototype.loadXRegisterMem = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'AE'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
            }
        };
        //Loads Y register from memory(OP Code AC)
        Cpu.prototype.loadYRegisterMem = function (location) {
            if (location != '') {
                this.PC += 3; //Add to program counter
                var table = document.getElementById("cpuTable");
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'AC'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[0].innerHTML = this.PC + ''; //PC
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
