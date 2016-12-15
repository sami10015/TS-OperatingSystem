///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(memory) {
            if (memory === void 0) { memory = []; }
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < 768; i++) {
                this.memory.push(0);
            }
        };
        //Reads and return op codes(array) located in specific memory slot
        Memory.prototype.read = function (memorySlotIndex) {
            var operationArray = [];
            if (memorySlotIndex == 0) {
                for (var i = 0; i < 256; i++) {
                    if (this.memory[i] != -1) {
                        operationArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            else if (memorySlotIndex == 1) {
                for (var i = 256; i < 512; i++) {
                    if (this.memory[i] != -1) {
                        operationArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            else if (memorySlotIndex == 2) {
                for (var i = 512; i < 768; i++) {
                    if (this.memory[i] != -1) {
                        operationArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            return operationArray;
        };
        //Writes op codes into specific memory slot
        Memory.prototype.write = function (memorySlotIndex, operation) {
            var operationArray = operation.split(" ");
            var opCount = 0;
            if (memorySlotIndex == 0) {
                for (var i = 0; i < 256; i++) {
                    if (i == operationArray.length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = operationArray[opCount];
                    opCount++;
                }
            }
            else if (memorySlotIndex == 1) {
                for (var i = 256; i < 512; i++) {
                    if (opCount == operationArray.length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = operationArray[opCount];
                    opCount++;
                }
            }
            else if (memorySlotIndex == 2) {
                for (var i = 512; i < 768; i++) {
                    if (opCount == operationArray.length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = operationArray[opCount];
                    opCount++;
                }
            }
            console.log(this.memory);
        };
        //Erase everything
        Memory.prototype.eraseAll = function () {
            this.init();
        };
        //Erases a specific block of memory's op codes
        Memory.prototype.eraseBlock = function (memorySlotIndex) {
            if (memorySlotIndex == 0) {
                for (var i = 0; i < 256; i++) {
                    this.memory[i] = 0;
                }
            }
            else if (memorySlotIndex == 1) {
                for (var i = 256; i < 512; i++) {
                    this.memory[i] = 0;
                }
            }
            else if (memorySlotIndex == 2) {
                for (var i = 512; i < 768; i++) {
                    this.memory[i] = 0;
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
