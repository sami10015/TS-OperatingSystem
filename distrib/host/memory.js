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
        Memory.prototype.read = function (memorySlotIndex) {
            if (memorySlotIndex == 0) {
            }
            else if (memorySlotIndex == 1) {
            }
            else if (memorySlotIndex == 2) {
            }
        };
        Memory.prototype.write = function (memorySlotIndex, operation) {
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
