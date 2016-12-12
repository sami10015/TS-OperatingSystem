///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var deviceDriverHDD = (function (_super) {
        __extends(deviceDriverHDD, _super);
        function deviceDriverHDD(formatted) {
            // Override the base method pointers.
            if (formatted === void 0) { formatted = false; }
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.formatted = formatted;
            this.driverEntry = this.krnHDDDriverEntry;
        }
        deviceDriverHDD.prototype.krnHDDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        };
        return deviceDriverHDD;
    }(TSOS.DeviceDriver));
    TSOS.deviceDriverHDD = deviceDriverHDD;
})(TSOS || (TSOS = {}));
