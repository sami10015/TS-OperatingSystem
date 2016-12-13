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
    var DeviceDriverHDD = (function (_super) {
        __extends(DeviceDriverHDD, _super);
        function DeviceDriverHDD(formatted) {
            // Override the base method pointers.
            if (formatted === void 0) { formatted = false; }
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.formatted = formatted;
            this.driverEntry = this.krnHDDDriverEntry;
        }
        DeviceDriverHDD.prototype.krnHDDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        };
        DeviceDriverHDD.prototype.krnHDDformat = function () {
            //Format the first TSB 
            var firstTSB = "1---MBR";
            var track = 0;
            var sector = 0;
            var block = 0;
            var TSB = track.toString() + sector.toString() + block.toString();
            //Create empty TSB
            var emptyData = '';
            //Create Empty Data
            for (var i = 0; i < 64; i++) {
                if (i >= 1 && i <= 3) {
                    emptyData += '-';
                }
                else {
                    emptyData += '0';
                }
            }
            //Input empty data
            for (var i = 0; i <= 999; i++) {
                //You dont want to make an extra TSB
                if (track == 3 && sector == 7 && block == 8) {
                    break;
                }
                //If the TSB is the first, format it correctly
                if (track == 0 && sector == 0 && block == 0) {
                    _hardDrive.write(TSB, firstTSB);
                    //Increment block
                    block++;
                }
                else {
                    //Change block, sector, and track numbers
                    if (block == 8) {
                        block = 0;
                        sector++;
                    }
                    if (sector == 8) {
                        block = 0;
                        sector = 0;
                        track++;
                    }
                    TSB = track.toString() + sector.toString() + block.toString();
                    _hardDrive.write(TSB, emptyData);
                    block++;
                }
            }
            this.formatted = true;
            this.updateHDDTable();
        };
        DeviceDriverHDD.prototype.krnHDDCreateFile = function (fileName) {
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileName = [];
            for (var i = 0; i < newFileName.length; i++) {
                hexFileName.push(newFileName[i].charCodeAt(0).toString(16));
            }
            console.log(hexFileName);
            //First find first empty file in the dir 
            //Second change file name to hex and place those bits in the data
            //Third to the end of the free data)
            //Update the table
        };
        DeviceDriverHDD.prototype.updateHDDTable = function () {
            var table = document.getElementById("hardDriveTable");
            var j = 1;
            //Form TSB Display
            var track = 0;
            var sector = 0;
            var block = 0;
            //Create Table
            for (var i = 0; i <= 999; i++) {
                if (track == 3 && sector == 7 && block == 8) {
                    break;
                }
                var row = table.insertRow(j);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                //Change block, sector, and track numbers
                if (block == 8) {
                    block = 0;
                    sector++;
                }
                if (sector == 8) {
                    block = 0;
                    sector = 0;
                    track++;
                }
                cell1.innerHTML = track.toString() + ':' + sector.toString() + ':' + block.toString();
                var TSB = track.toString() + sector.toString() + block.toString();
                cell2.innerHTML = _hardDrive.read(TSB);
                block++;
                j++;
            }
        };
        return DeviceDriverHDD;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
