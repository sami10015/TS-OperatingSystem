///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        //The plan for the cpu Scheduler is to use arrays and indexes to keep track of whats running and what isnt
        //Use count to check if it is up to the quantum, if so, context switch
        function cpuScheduler(quantum, count, RR, currentPid, loaded, PCList, StateList) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 0; }
            if (RR === void 0) { RR = false; }
            if (currentPid === void 0) { currentPid = -1; }
            if (loaded === void 0) { loaded = []; }
            if (PCList === void 0) { PCList = []; }
            if (StateList === void 0) { StateList = []; }
            this.quantum = quantum;
            this.count = count;
            this.RR = RR;
            this.currentPid = currentPid;
            this.loaded = loaded;
            this.PCList = PCList;
            this.StateList = StateList;
        }
        cpuScheduler.prototype.contextSwitch = function () {
        };
        cpuScheduler.prototype.roundRobin = function () {
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
