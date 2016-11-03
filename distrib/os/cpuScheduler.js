///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        //The plan for the cpu Scheduler is to use arrays and indexes to keep track of whats running and what isnt
        //Use count to check if it is up to the quantum, if so, context switch
        //False for not running in the readyQueue and is ready to run, true for running
        function cpuScheduler(quantum, count, RR, residentList, PCList, readyQueue, readyQueue2, residentList2) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 0; }
            if (RR === void 0) { RR = false; }
            if (residentList === void 0) { residentList = [-1, -1, -1]; }
            if (PCList === void 0) { PCList = [-1, -1, -1]; }
            if (readyQueue === void 0) { readyQueue = [false, false, false]; }
            if (readyQueue2 === void 0) { readyQueue2 = new TSOS.Queue(); }
            if (residentList2 === void 0) { residentList2 = []; }
            this.quantum = quantum;
            this.count = count;
            this.RR = RR;
            this.residentList = residentList;
            this.PCList = PCList;
            this.readyQueue = readyQueue;
            this.readyQueue2 = readyQueue2;
            this.residentList2 = residentList2;
        }
        cpuScheduler.prototype.contextSwitch = function () {
            //Round Robin Scheduling
            if (this.RR) {
            }
        };
        //This function is used along with the clearmem command to clear everything in the scheduler as well
        cpuScheduler.prototype.clearMem = function () {
            this.residentList = [-1, -1, -1];
            this.PCList = [-1, -1, -1];
            this.readyQueue = [false, false, false];
        };
        //This function is used to keep track of the PC of each running program, the count/quantum comparison, 
        cpuScheduler.prototype.updatePCList = function (PC, PID) {
            //Update the PC 
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i] == PID) {
                    this.PCList[i] = PC;
                }
            }
            this.count++; //Increment count
            //Check if count and quantum are the same, if so a context switch is needed
            if (this.count == this.quantum) {
                this.contextSwitch();
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
