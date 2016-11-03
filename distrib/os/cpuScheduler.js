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
                var tempPCB = this.readyQueue.dequeue();
                if (tempPCB.State != "TERMINATED") {
                    _PCB = tempPCB;
                    this.readyQueue.enqueue(tempPCB);
                }
            }
        };
        //This function is used along with the clearmem command to clear everything in the scheduler
        cpuScheduler.prototype.clearMem = function () {
            this.RR = false;
            this.readyQueue.q = new Array();
        };
        //Fill up the ready queue with the PCBs loaded in the residentList when you do a runall
        cpuScheduler.prototype.loadReadyQueue = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].State != "TERMINATED") {
                    this.readyQueue.enqueue(this.residentList[i]);
                }
            }
        };
        //Increment counter, if equal to quantum, context switch
        cpuScheduler.prototype.checkCount = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 0;
                this.contextSwitch();
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
