///<reference path="../globals.ts" />
///<reference path="queue.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(quantum, count, RR, residentList, readyQueue) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 0; }
            if (RR === void 0) { RR = false; }
            if (residentList === void 0) { residentList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.quantum = quantum;
            this.count = count;
            this.RR = RR;
            this.residentList = residentList;
            this.readyQueue = readyQueue;
        }
        cpuScheduler.prototype.contextSwitch = function () {
            //Round Robin Scheduling
            if (this.RR) {
            }
        };
        //This function is used along with the clearmem command to clear everything in the scheduler as well
        cpuScheduler.prototype.clearMem = function () {
            this.residentList = [];
            this.readyQueue.q = new Array();
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
