///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(PID, State, PC, AC, IR, X, Y, Z, Base, Limit, Part, waitTime, rowNumber, priority, inHDD) {
            if (PID === void 0) { PID = -1; }
            if (State === void 0) { State = ''; }
            if (PC === void 0) { PC = 0; }
            if (AC === void 0) { AC = 0; }
            if (IR === void 0) { IR = ''; }
            if (X === void 0) { X = 0; }
            if (Y === void 0) { Y = 0; }
            if (Z === void 0) { Z = 0; }
            if (Base === void 0) { Base = 0; }
            if (Limit === void 0) { Limit = 0; }
            if (Part === void 0) { Part = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            if (rowNumber === void 0) { rowNumber = 1; }
            if (priority === void 0) { priority = 0; }
            if (inHDD === void 0) { inHDD = false; }
            this.PID = PID;
            this.State = State;
            this.PC = PC;
            this.AC = AC;
            this.IR = IR;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.Base = Base;
            this.Limit = Limit;
            this.Part = Part;
            this.waitTime = waitTime;
            this.rowNumber = rowNumber;
            this.priority = priority;
            this.inHDD = inHDD;
        }
        PCB.prototype.init = function (PID, priority) {
            if (priority === void 0) { priority = 32; }
            this.PID = PID;
            this.Base = this.getBase(_MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]);
            this.Limit = this.getLimit(_MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]);
            this.Part = this.getPart(_MemoryManager.PIDList[_MemoryManager.PIDList.length - 1]);
            this.priority = priority;
        };
        PCB.prototype.displayPCB = function () {
            var table = document.getElementById("PCB_Table");
            var row = table.getElementsByTagName("tr")[this.rowNumber];
            row.getElementsByTagName("td")[0].innerHTML = this.PID + '';
            row.getElementsByTagName("td")[1].innerHTML = this.State;
            row.getElementsByTagName("td")[2].innerHTML = (this.PC + this.Base) + '';
            row.getElementsByTagName("td")[3].innerHTML = this.AC + '';
            row.getElementsByTagName("td")[4].innerHTML = this.IR;
            row.getElementsByTagName("td")[5].innerHTML = this.X + '';
            row.getElementsByTagName("td")[6].innerHTML = this.Y + '';
            row.getElementsByTagName("td")[7].innerHTML = this.Z + '';
            if (this.inHDD) {
                row.getElementsByTagName("td")[8].innerHTML = 'Hard Drive';
            }
            else {
                row.getElementsByTagName("td")[8].innerHTML = 'Memory';
            }
            this.getBase(_PCB.PID);
            this.getLimit(_PCB.PID);
            this.getPart(_PCB.PID);
        };
        PCB.prototype.insertSingleRunRow = function () {
            var table = document.getElementById("PCB_Table");
            //Display current PCB
            var row = table.insertRow(this.rowNumber);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            var cell8 = row.insertCell(7);
            var cell9 = row.insertCell(8);
            cell1.innerHTML = _PCB.PID + '';
            cell2.innerHTML = _PCB.State;
            cell3.innerHTML = _PCB.PC + '';
            cell4.innerHTML = _PCB.AC + '';
            cell5.innerHTML = _PCB.IR;
            cell6.innerHTML = _PCB.X + '';
            cell7.innerHTML = _PCB.Y + '';
            cell8.innerHTML = _PCB.Z + '';
            if (this.inHDD) {
                cell9.innerHTML = 'Hard Drive';
            }
            else {
                cell9.innerHTML = 'Memory';
            }
            _PCB.getBase(_PCB.PID);
            _PCB.getLimit(_PCB.PID);
            _PCB.getPart(_PCB.PID);
        };
        PCB.prototype.clearPCB = function () {
            //Terminated PCB
            this.State = 'TERMINATED';
            var table = document.getElementById("PCB_Table");
            if (_cpuScheduler.fcfs) {
                table.deleteRow(1);
            }
            else {
                table.deleteRow(this.rowNumber);
                //If multiple PCBs are in display
                if (_cpuScheduler.RR) {
                    _cpuScheduler.deIncrementRowNum();
                }
            }
        };
        PCB.prototype.getPID = function () {
            this.PID = _CPU.PID;
            return _CPU.PID;
        };
        PCB.prototype.getPC = function () {
            this.PC = _CPU.PC;
            return _CPU.PC;
        };
        PCB.prototype.getAcc = function () {
            this.AC = _CPU.Acc;
            return _CPU.Acc;
        };
        PCB.prototype.setIR = function (IR) {
            this.IR = IR;
        };
        PCB.prototype.getXReg = function () {
            this.X = _CPU.Xreg;
            return _CPU.Xreg;
        };
        PCB.prototype.getYReg = function () {
            this.Y = _CPU.Yreg;
            return _CPU.Yreg;
        };
        PCB.prototype.getZFlag = function () {
            this.Z = _CPU.Zflag;
            return _CPU.Zflag;
        };
        PCB.prototype.getBase = function (PID) {
            var index = _MemoryManager.memoryIndex(PID);
            if (index == 0) {
                this.Base = 0;
                return 0;
            }
            else if (index == 1) {
                this.Base = 256;
                return 256;
            }
            else if (index == 2) {
                this.Base = 512;
                return 512;
            }
        };
        PCB.prototype.getLimit = function (PID) {
            var index = _MemoryManager.memoryIndex(PID);
            if (index == 0) {
                this.Limit = 256;
                return 256;
            }
            else if (index == 1) {
                this.Limit = 512;
                return 512;
            }
            else if (index == 2) {
                this.Limit = 768;
                return 768;
            }
        };
        PCB.prototype.getPart = function (PID) {
            var index = _MemoryManager.memoryIndex(PID);
            if (index == 0) {
                this.Part = 1;
                return 1;
            }
            else if (index == 1) {
                this.Part = 2;
                return 2;
            }
            else if (index == 2) {
                this.Part = 3;
                return 3;
            }
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
