///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(memorySpace, PID_Memory_Loc) {
            if (memorySpace === void 0) { memorySpace = [0, 0, 0]; }
            if (PID_Memory_Loc === void 0) { PID_Memory_Loc = [-1, -1, -1]; }
            this.memorySpace = memorySpace;
            this.PID_Memory_Loc = PID_Memory_Loc;
        }
        MemoryManager.prototype.init = function () { };
        MemoryManager.prototype.clearAll = function () {
        };
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
        MemoryManager.prototype.clearBlock = function (pID) {
            for (var i = 0; i < this.PID_Memory_Loc.length; i++) {
                if (this.PID_Memory_Loc[i] == pID) {
                    var table = document.getElementById("processMemTable");
                    if (i == 0) {
                        this.PID_Memory_Loc[0] = -1; //Free that space
                        this.memorySpace[0] = 0; //Free that space
                        for (var i = 0; i <= 32; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 1) {
                        this.PID_Memory_Loc[1] = -1; //Free that space
                        this.memorySpace[1] = 0; //Free that space
                        for (var i = 33; i <= 64; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    else if (i == 2) {
                        this.PID_Memory_Loc[2] = -1; //Free that space
                        this.memorySpace[2] = 0; //Free that space
                        for (var i = 65; i <= 96; i++) {
                            var row = table.getElementsByTagName("tr")[i];
                            for (var j = 1; j < 9; j++) {
                                row.getElementsByTagName("td")[j].innerHTML = '0';
                            }
                        }
                    }
                    break;
                }
            }
        };
        MemoryManager.prototype.hexToDec = function (input) {
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
