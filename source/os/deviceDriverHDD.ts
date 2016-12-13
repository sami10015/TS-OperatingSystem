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
                    _hardDrive.write(TSB,emptyData);

                    block++;
                }
            }
            this.formatted = true;
            this.updateHDDTable();
        }

        public krnHDDCreateFile(fileName){
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileName = [];
            for(var i = 0; i < newFileName.length; i++){
                hexFileName.push(newFileName[i].charCodeAt(0).toString(16))
            }
            console.log(hexFileName);
            //First find first empty file in the dir 
            //Second change file name to hex and place those bits in the data
            //Third to the end of the free data)
            //Update the table
        }

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
