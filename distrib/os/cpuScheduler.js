///<reference path="../globals.ts" />
///<reference path="queue.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(quantum, count, RR, residentList, readyQueue) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 1; }
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
                //debugger;
                if (this.readyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                }
                else {
                    if (_PCB.State != "TERMINATED") {
                        this.readyQueue.enqueue(_PCB);
                    }
                    _PCB = this.readyQueue.dequeue();
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
            _PCB = this.readyQueue.dequeue(); //Set the current PCB to the first item in the ready queue
        };
        //Increment counter, if equal to quantum, context switch
        cpuScheduler.prototype.checkCount = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.contextSwitch();
                this.count = 1;
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
