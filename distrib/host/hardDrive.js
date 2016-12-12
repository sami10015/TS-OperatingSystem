///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var hardDrive = (function () {
        function hardDrive() {
        }
        hardDrive.prototype.write = function (tsb, data) {
        };
        hardDrive.prototype.delete = function (tsb) {
        };
        hardDrive.prototype.read = function (tsb) {
        };
        return hardDrive;
    }());
    TSOS.hardDrive = hardDrive;
})(TSOS || (TSOS = {}));
