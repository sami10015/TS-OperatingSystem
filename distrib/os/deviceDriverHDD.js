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
        //Load the driver
        DeviceDriverHDD.prototype.krnHDDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        };
        //Format the HDD
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
                    _hardDrive.TSBList.push(TSB);
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
                    _hardDrive.TSBList.push(TSB);
                    _hardDrive.write(TSB, emptyData);
                    block++;
                }
            }
            this.formatted = true;
            this.updateHDDTable();
        };
        //Function to create a file
        DeviceDriverHDD.prototype.krnHDDCreateFile = function (fileName) {
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for (var i = 0; i < newFileName.length; i++) {
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16));
            }
            //Find first empty file in the directory
            for (var i = 0; i < 999; i++) {
                var TSB = _hardDrive.TSBList[i];
                var validInvalidBit = _hardDrive.read(TSB).split("")[0];
                //Full on files
                if (TSB == "100") {
                    return -1;
                }
                //Check if file is already created
                if (validInvalidBit == '1' && i > 0) {
                    //Get file data, use slice to not account for the possible linkage(just looking for file name)
                    var data = _hardDrive.read(TSB).split("").slice(4);
                    var compareData = '';
                    //Create comparison data
                    for (var i = 0; i < hexFileNameList.length; i++) {
                        compareData += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for (var x = compareData.length - 1; x < 60; x++) {
                        compareData += '0';
                    }
                    //If they are the same, then the file has already been created
                    if (data.join("") == compareData) {
                        return 0;
                    }
                }
                else if (validInvalidBit == '0' && i > 0) {
                    //Create data for file(For some reason I have to use different variable names for compiling to work)
                    var data2 = '1---';
                    for (var i = 0; i < hexFileNameList.length; i++) {
                        data2 += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for (var i = data2.length - 1; i < 64; i++) {
                        data2 += '0';
                    }
                    //Write to HDD and update HDD Table
                    _hardDrive.write(TSB, data2);
                    this.updateHDDTable();
                    return 1;
                }
            }
        };
        DeviceDriverHDD.prototype.krnHDDWriteFile = function (filename, data) {
            debugger;
            this.krnHDDCheckFileExists(filename);
            //See how many bytes the data is when converted to hex
            //Change data to hex
            var newData = data.split("");
            var hexData = [];
            for (var i = 0; i < newData.length; i++) {
                hexData.push(newData[i].charCodeAt(0).toString(16));
            }
            console.log(hexData);
            console.log(hexData.length);
            // //Find first empty data block
            // var start = 0;
            // //Get the start of the file TSB
            // for(var i = 0; i < _hardDrive.TSBList.length; i++){
            //     if(_hardDrive.TSBList[i] == '100'){
            //         start = i;
            //         break;
            //     }
            // }
            // for(var i = start; i < _hardDrive.TSBList.length; i++){
            //     //Find first open block
            //     if(_hardDrive.TSBList[i].split("")[0] == '0'){
            //     }
            // }
        };
        DeviceDriverHDD.prototype.krnHDDCheckFileExists = function (fileName) {
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for (var i = 0; i < newFileName.length; i++) {
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16));
            }
            //Loop through all of the TSBs
            for (var j = 0; j < _hardDrive.TSBList.length; j++) {
                var TSB = _hardDrive.TSBList[j];
                //It has reached the end and no file exists
                if (TSB === "100") {
                    return false;
                }
                //Create comparison data
                //Get file data, use slice to not account for the possible linkage(just looking for file name)
                var data = _hardDrive.read(TSB).split("").slice(4);
                var compareData = '';
                //Create comparison data
                for (var x = 0; x < hexFileNameList.length; x++) {
                    compareData += hexFileNameList[x];
                }
                //Append 0s to the end of file name
                for (var y = compareData.length - 1; y < 60; y++) {
                    compareData += '0';
                }
                //If they are the same, then the file has already been created
                if (data.join("") == compareData) {
                    return true;
                }
            }
        };
        //Update the HTML table, soon to be moved elsewhere
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
