///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var hardDrive = (function () {
        function hardDrive(TSBList) {
            if (TSBList === void 0) { TSBList = []; }
            this.TSBList = TSBList;
        }
        //Write data to the HDD
        hardDrive.prototype.write = function (tsb, data) {
            sessionStorage[tsb] = data;
        };
        //Return data from the HDD
        hardDrive.prototype.read = function (tsb) {
            return sessionStorage[tsb];
        };
        return hardDrive;
    }());
    TSOS.hardDrive = hardDrive;
})(TSOS || (TSOS = {}));
