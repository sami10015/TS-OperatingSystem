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
                if (this.readyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                    document.getElementById("btnSingleStepToggle").value = "Single Step: Off";
                    document.getElementById("btnStep").disabled = true;
                    _SingleStepMode = false;
                    this.clearMem();
                }
                else {
                    if (_PCB.State != "TERMINATED") {
                        _PCB.State = "Ready";
                        this.readyQueue.enqueue(_PCB);
                    }
                    _PCB = this.readyQueue.dequeue();
                    _PCB.State = "Running";
                }
            }
        };
        //This function is used along with the clearmem command to clear everything in the scheduler
        cpuScheduler.prototype.clearMem = function () {
            this.RR = false;
            this.readyQueue.q = new Array();
            this.count = 1;
        };
        //Fill up the ready queue with the PCBs loaded in the residentList when you do a runall
        cpuScheduler.prototype.loadReadyQueue = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].State != "TERMINATED") {
                    this.readyQueue.enqueue(this.residentList[i]);
                }
            }
            _PCB = this.readyQueue.dequeue(); //Set the current PCB to the first item in the ready queue
            _PCB.State = "Running";
        };
        //Increment counter, if equal to quantum, context switch
        cpuScheduler.prototype.checkCount = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 1;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event')); //Call An Interrupt
            }
        };
        //Function to display PCBs in Ready Queue
        cpuScheduler.prototype.displayReadyQueue = function () {
            var table = document.getElementById("PCB_Table");
            if (table.rows.length == 1) {
                for (var i = 1; i < this.readyQueue.getSize() + 1; i++) {
                    var tempPCB = this.readyQueue.q[i]; //Get PCB from Ready Queue without dequeing
                    var row = table.insertRow(i);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    var cell6 = row.insertCell(5);
                    var cell7 = row.insertCell(6);
                    var cell8 = row.insertCell(7);
                    var cell9 = row.insertCell(8);
                    var cell10 = row.insertCell(9);
                    var cell11 = row.insertCell(10);
                    cell1.innerHTML = tempPCB.PID;
                    cell2.innerHTML = tempPCB.State;
                    cell3.innerHTML = tempPCB.PC;
                    cell4.innerHTML = tempPCB.AC;
                    cell5.innerHTML = tempPCB.IR;
                    cell6.innerHTML = tempPCB.X;
                    cell7.innerHTML = tempPCB.Y;
                    cell8.innerHTML = tempPCB.Z;
                    cell9.innerHTML = tempPCB.getBase(tempPCB.PID);
                    cell9.innerHTML = tempPCB.getLimit(tempPCB.PID);
                    cell10.innerHTML = tempPCB.getPart(tempPCB.PID);
                }
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
