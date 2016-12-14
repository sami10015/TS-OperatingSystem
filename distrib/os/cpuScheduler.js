///<reference path="../globals.ts" />
///<reference path="queue.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(quantum, count, RR, fcfs, residentList, readyQueue, turnaroundTime) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 1; }
            if (RR === void 0) { RR = true; }
            if (fcfs === void 0) { fcfs = false; }
            if (residentList === void 0) { residentList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (turnaroundTime === void 0) { turnaroundTime = 0; }
            this.quantum = quantum;
            this.count = count;
            this.RR = RR;
            this.fcfs = fcfs;
            this.residentList = residentList;
            this.readyQueue = readyQueue;
            this.turnaroundTime = turnaroundTime;
        }
        cpuScheduler.prototype.contextSwitch = function () {
            //Round Robin Scheduling
            if (this.RR) {
                if (this.readyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                    this.turnaroundTime = 0;
                    document.getElementById("btnSingleStepToggle").value = "Single Step: Off";
                    document.getElementById("btnStep").disabled = true;
                    _SingleStepMode = false;
                    this.clearMem();
                }
                else {
                    if (_PCB.State != "TERMINATED") {
                        _PCB.State = "Ready";
                        _PCB.displayPCB();
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
            var rowCounter = 1; //Indicate which row in the ready queue display the PCB is located in
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].State != "TERMINATED") {
                    this.residentList[i].rowNumber = rowCounter;
                    this.readyQueue.enqueue(this.residentList[i]);
                    rowCounter++; //Increment row
                }
            }
            _PCB = this.readyQueue.dequeue(); //Set the current PCB to the first item in the ready queue
            _PCB.State = "Running";
        };
        //Increment counters, if equal to quantum, context switch
        cpuScheduler.prototype.checkCount = function () {
            //this.turnaroundTime++;
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
                //Display current PCB
                var row = table.insertRow(1);
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
                cell1.innerHTML = _PCB.PID + '';
                cell2.innerHTML = _PCB.State;
                cell3.innerHTML = _PCB.PC + '';
                cell4.innerHTML = _PCB.AC + '';
                cell5.innerHTML = _PCB.IR;
                cell6.innerHTML = _PCB.X + '';
                cell7.innerHTML = _PCB.Y + '';
                cell8.innerHTML = _PCB.Z + '';
                cell9.innerHTML = _PCB.getBase(_PCB.PID) + '';
                cell9.innerHTML = _PCB.getLimit(_PCB.PID) + '';
                cell10.innerHTML = _PCB.getPart(_PCB.PID) + '';
                for (var i = 0; i < this.readyQueue.getSize(); i++) {
                    var tempPCB = this.readyQueue.q[i]; //Get PCB from Ready Queue without dequeing
                    tempPCB.State = "Ready";
                    var row = table.insertRow(i + 2);
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
                    cell1.innerHTML = tempPCB.PID + '';
                    cell2.innerHTML = tempPCB.State;
                    cell3.innerHTML = tempPCB.PC + '';
                    cell4.innerHTML = tempPCB.AC + '';
                    cell5.innerHTML = tempPCB.IR;
                    cell6.innerHTML = tempPCB.X + '';
                    cell7.innerHTML = tempPCB.Y + '';
                    cell8.innerHTML = tempPCB.Z + '';
                    cell9.innerHTML = tempPCB.getBase(tempPCB.PID) + '';
                    cell9.innerHTML = tempPCB.getLimit(tempPCB.PID) + '';
                    cell10.innerHTML = tempPCB.getPart(tempPCB.PID) + '';
                }
            }
        };
        //When a row is deleted from PCB display, deincrement a row number
        cpuScheduler.prototype.deIncrementRowNum = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue.q[i].rowNumber > 1) {
                    this.readyQueue.q[i].rowNumber -= 1;
                }
            }
            if (_PCB.PID > 1) {
                _PCB.rowNumber -= 1;
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
