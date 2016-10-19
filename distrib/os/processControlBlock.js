///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(PID, State, PC, AC, IR, X, Y, Z, Base, Limit, Part) {
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
        }
        PCB.prototype.displayPCB = function (State) {
            var table = document.getElementById("PCB_Table");
            var row = table.getElementsByTagName("tr")[1];
            row.getElementsByTagName("td")[0].innerHTML = this.getPID() + '';
            row.getElementsByTagName("td")[1].innerHTML = State;
            row.getElementsByTagName("td")[2].innerHTML = this.getPC() + '';
            row.getElementsByTagName("td")[3].innerHTML = this.getAcc() + '';
            row.getElementsByTagName("td")[4].innerHTML = this.IR;
            row.getElementsByTagName("td")[5].innerHTML = this.getXReg() + '';
            row.getElementsByTagName("td")[6].innerHTML = this.getYReg() + '';
            row.getElementsByTagName("td")[7].innerHTML = this.getZFlag() + '';
            row.getElementsByTagName("td")[8].innerHTML = this.getBase(this.PID) + '';
            row.getElementsByTagName("td")[9].innerHTML = this.getLimit(this.PID) + '';
            row.getElementsByTagName("td")[10].innerHTML = this.getPart(this.PID) + '';
        };
        PCB.prototype.clearPCB = function () {
            //Empty Values
            this.PID = -1;
            this.State = '';
            this.PC = 0;
            this.AC = 0;
            this.IR = '';
            this.X = 0;
            this.Y = 0;
            this.Z = 0;
            this.Base = 0;
            this.Limit = 0;
            this.Part = 0;
            //Clear Display
            var table = document.getElementById("PCB_Table");
            var row = table.getElementsByTagName("tr")[1];
            row.getElementsByTagName("td")[0].innerHTML = '';
            row.getElementsByTagName("td")[1].innerHTML = '';
            row.getElementsByTagName("td")[2].innerHTML = '';
            row.getElementsByTagName("td")[3].innerHTML = '';
            row.getElementsByTagName("td")[4].innerHTML = '';
            row.getElementsByTagName("td")[5].innerHTML = '';
            row.getElementsByTagName("td")[6].innerHTML = '';
            row.getElementsByTagName("td")[7].innerHTML = '';
            row.getElementsByTagName("td")[8].innerHTML = '';
            row.getElementsByTagName("td")[9].innerHTML = '';
            row.getElementsByTagName("td")[10].innerHTML = '';
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
                this.Limit = 756;
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
