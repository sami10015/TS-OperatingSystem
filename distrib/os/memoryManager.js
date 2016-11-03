///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(memorySpace, PID_Memory_Loc, PIDList, executedPID, operationIndex) {
            if (memorySpace === void 0) { memorySpace = [0, 0, 0]; }
            if (PID_Memory_Loc === void 0) { PID_Memory_Loc = [-1, -1, -1]; }
            if (PIDList === void 0) { PIDList = []; }
            if (executedPID === void 0) { executedPID = []; }
            if (operationIndex === void 0) { operationIndex = 0; }
            this.memorySpace = memorySpace;
            this.PID_Memory_Loc = PID_Memory_Loc;
            this.PIDList = PIDList;
            this.executedPID = executedPID;
            this.operationIndex = operationIndex;
        }
        //Clear all memory and display
        MemoryManager.prototype.clearAll = function () {
            this.memorySpace = [0, 0, 0];
            this.PID_Memory_Loc = [-1, -1, -1];
            _Memory.eraseAll();
            this.clearDisplay();
            //Add all unexecuted PIDs to executed PIDs list
            for (var i = 0; i < this.PIDList.length; i++) {
                var pid = this.PIDList[i]; //Comparison PID
                var counter = 0; //Use this counter to check if it has been executed or not
                for (var j = 0; j < this.executedPID.length; j++) {
                    if (pid != this.executedPID[i]) {
                        counter++;
                    }
                }
                if (counter == this.executedPID.length) {
                    this.executedPID.push(pid);
                }
            }
        };
        //Displays the memory block and checks if the memory blocks are full
        MemoryManager.prototype.displayBlock = function (operation) {
            //Change process memory table
            var table = document.getElementById("processMemTable");
            var fullCount = 0; //If this reaches three, you can't load anymore
            var index = -1; //Variable to keep track of where PID is being loaded into 
            //Fill process memory table, if space allows
            for (var i = 0; i < this.memorySpace.length; i++) {
                if (this.memorySpace[i] == 0) {
                    if (i == 0) {
                        index = i;
                        var opCount = 0; //Variable to hold operation substring position
                        for (var i = 0; i <= 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > operation.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        this.memorySpace[0] = 1; //Memory space is used
                    }
                    else if (i == 1) {
                        index = i;
                        var opCount = 0; //Variable to hold operation substring position
                        for (var i = 33; i <= 64; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > operation.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        this.memorySpace[1] = 1; //Memory space is used(2nd block)
                    }
                    else if (i == 2) {
                        index = i;
                        var opCount = 0; //Variable to hold operation substring position
                        for (var i = 65; i <= 96; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                if (opCount + 2 > operation.length) {
                                    row.getElementsByTagName("td")[j].innerHTML = '0';
                                }
                                else {
                                    row.getElementsByTagName("td")[j].innerHTML = operation.substring(opCount, opCount + 2);
                                    opCount += 3;
                                }
                            }
                        }
                        this.memorySpace[2] = 1; //Memory space is used(3rd block)
                    }
                    break; //Leave loop
                }
                else {
                    fullCount += 1;
                }
            }
            return index;
        };
        //Clears the memory block
        MemoryManager.prototype.clearBlock = function (pID) {
            var index = -1; //Index for block to clear
            for (var i = 0; i < this.PID_Memory_Loc.length; i++) {
                if (this.PID_Memory_Loc[i] == pID) {
                    var table = document.getElementById("processMemTable");
                    if (i == 0) {
                        this.PID_Memory_Loc[0] = -1; //Free that space
                        this.memorySpace[0] = 0; //Free that space
                        index = 0; //Block to clear
                        for (var i = 0; i < 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 1) {
                        this.PID_Memory_Loc[1] = -1; //Free that space
                        this.memorySpace[1] = 0; //Free that space
                        index = 1; //Block to clear
                        for (var i = 32; i < 64; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 2) {
                        this.PID_Memory_Loc[2] = -1; //Free that space
                        this.memorySpace[2] = 0; //Free that space
                        index = 2; //Block to clear
                        for (var i = 64; i < 96; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    break;
                }
            }
            _Memory.eraseBlock(index); //Erase memory
        };
        //Updates the memory display as the program runs
        MemoryManager.prototype.updateBlock = function (PID) {
            var memoryIndex = this.memoryIndex(PID); //1st block, 2nd block, 3rd block
            var opIndex = 0; //0 - 256, 256 - 512, etc
            var table = document.getElementById("processMemTable");
            if (memoryIndex == 0) {
                for (var i = 0; i < 32; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        row.getElementsByTagName("td")[j].innerHTML = this.getVariable(opIndex) + '';
                        opIndex++;
                    }
                }
            }
            else if (memoryIndex == 1) {
                opIndex += 256;
                for (var i = 32; i < 64; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        row.getElementsByTagName("td")[j].innerHTML = this.getVariable(opIndex) + '';
                        opIndex++;
                    }
                }
            }
            else if (memoryIndex == 2) {
                opIndex += 512;
                for (var i = 64; i < 96; i++) {
                    var row = table.getElementsByTagName("tr")[i];
                    for (var j = 1; j < 9; j++) {
                        row.getElementsByTagName("td")[j].innerHTML = this.getVariable(opIndex) + '';
                        opIndex++;
                    }
                }
            }
        };
        //Clears all memory blocks display
        MemoryManager.prototype.clearDisplay = function () {
            var table = document.getElementById("processMemTable");
            for (var i = 0; i < 96; i++) {
                var row = table.getElementsByTagName("tr")[i];
                for (var j = 1; j < 9; j++) {
                    row.getElementsByTagName("td")[j].innerHTML = '00';
                }
            }
        };
        //Easy hex to decimal translation
        MemoryManager.prototype.hexToDec = function (input) {
            return parseInt(input, 16);
        };
        //Return correct index for memory block
        MemoryManager.prototype.memoryIndex = function (PID) {
            for (var i = 0; i < this.PID_Memory_Loc.length; i++) {
                if (this.PID_Memory_Loc[i] == PID) {
                    return i;
                }
            }
        };
        //Get whatever variable is located at the location in memory
        MemoryManager.prototype.getVariable = function (location) {
            if ((location > _PCB.Limit || location < _PCB.Base)) {
                _StdOut.putText("Memory Access Violation!");
            }
            else {
                return _Memory.memory[location];
            }
        };
        //Get OP Codes from Memory
        MemoryManager.prototype.getOperation = function (index) {
            return _Memory.read(index);
        };
        //Write OP Code into Memory Address
        MemoryManager.prototype.writeOPCode = function (constant, address) {
            if (address > _PCB.Limit || address < _PCB.Base) {
                _StdOut.putText("Memory Access Violation!");
            }
            else {
                _Memory.memory[address] = constant;
            }
        };
        //Little Endian Address
        MemoryManager.prototype.littleEndianAddress = function (addressBase, addressEnd) {
            if (addressBase == '00' && addressEnd == '00') {
                return 0;
            }
            var address = 0;
            var str = '';
            if (addressEnd == '00' && addressBase != '00') {
                str += addressBase;
            }
            else {
                str += addressEnd;
                str += addressBase;
            }
            address = this.hexToDec(str);
            return address;
        };
        //Increment correct PID
        MemoryManager.prototype.pIDReturn = function () {
            if (this.PIDList[0] == null) {
                this.PIDList.push(0);
            }
            else {
                this.PIDList.push(this.PIDList[this.PIDList.length - 1] + 1);
            }
        };
        //Write to memory from memory manager
        MemoryManager.prototype.writeToMemory = function (index, operation) {
            _Memory.write(index, operation);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
