///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel HDD Device Driver.
   ---------------------------------- */

module TSOS {
    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {

        constructor(public formatted = false) {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnHDDDriverEntry;
        }

        public krnHDDDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        }

        public krnHDDformat(){
            //Format the first TSB 
            var firstTSB = "1---MBR";
            var track = 0
            var sector = 0
            var block = 0
            var TSB = track.toString() + sector.toString() + block.toString();
            //Create empty TSB
            var emptyData = '';

            //Create Empty Data
            for(var i = 0; i < 64; i++){
                if(i >= 1 && i <= 3){
                    emptyData += '-';        
                }else{
                    emptyData += '0';
                }
            }

            //Input empty data
            for(var i = 0; i <= 999; i++){
                //You dont want to make an extra TSB
                if(track == 3 && sector == 7 && block == 8){
                    break;
                }
                //If the TSB is the first, format it correctly
                if(track == 0 && sector == 0 && block == 0){
                    _hardDrive.write(TSB,firstTSB);
                    _hardDrive.TSBList.push(TSB);
                    //Increment block
                    block++;
                }else{ //Fill otherwise
                    //Change block, sector, and track numbers
                    if(block == 8){
                        block = 0;
                        sector++;
                    }
                    if(sector == 8){
                        block = 0;
                        sector = 0;
                        track++;
                    }

                    TSB = track.toString() + sector.toString() + block.toString();
                    _hardDrive.TSBList.push(TSB);
                    _hardDrive.write(TSB,emptyData);

                    block++;
                }
            }
            this.formatted = true;
            this.updateHDDTable();
        }

        //Function to create a file
        public krnHDDCreateFile(fileName){
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for(var i = 0; i < newFileName.length; i++){
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16))
            }
 
            //Find first empty file in the directory
            for(var i = 0; i < 999; i++){
                var TSB = _hardDrive.TSBList[i];
                var validInvalidBit = _hardDrive.read(TSB).split("")[0];
                //Full on files
                if(TSB == "100"){
                    return -1;
                }
                //Check if file is already created
                if(validInvalidBit == '1' && i > 0){
                    //Get file data and match count of file name
                    var data = _hardDrive.read(TSB).split("");
                    var compareData = '1---';
                    //Create comparison data
                    for(var i = 0; i < hexFileNameList.length; i++){
                        compareData += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for(var i = compareData.length-1; i < 64; i++){
                        compareData += '0';
                    }
                    //If they are the same, then the file has already been created
                    if(data.join("") == compareData){
                        return 0;
                    }
                }else if(validInvalidBit == '0' && i > 0){ //Found an empty not in use file
                    //Create data for file(For some reason I have to use different variable names for compiling to work)
                    var data2 = '1---';
                    for(var i = 0; i < hexFileNameList.length; i++){
                        data2 += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for(var i = data2.length-1; i < 64; i++){
                        data2 += '0';
                    }
                    //Write to HDD and update HDD Table
                    _hardDrive.write(TSB, data2);
                    this.updateHDDTable();
                    return 1;
                }
            }
        }

        //Update the HTML table, soon to be moved elsewhere
        public updateHDDTable(): void{
            var table = (<HTMLTableElement>document.getElementById("hardDriveTable"));
            var j = 1;
            //Form TSB Display
            var track = 0;
            var sector = 0;
            var block = 0;

            //Create Table
            for(var i = 0; i <= 999; i++){
                if(track == 3 && sector == 7 && block == 8){
                    break;
                }
                var row = table.insertRow(j);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);

                //Change block, sector, and track numbers
                if(block == 8){
                    block = 0;
                    sector++;
                }
                if(sector == 8){
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
        }

    }
}
