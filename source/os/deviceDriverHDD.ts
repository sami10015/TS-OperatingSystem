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

        //Load the driver
        public krnHDDDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        }

        //Format the HDD
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
            for(var j = 0; j < 999; j++){
                var TSB = _hardDrive.TSBList[j];
                var validInvalidBit = _hardDrive.read(TSB).split("")[0];
                //Full on files
                if(TSB == "100"){
                    return -1;
                }
                //Check if file is already created
                if(validInvalidBit == '1' && i > 0){
                    //Get file data, use slice to not account for the possible linkage(just looking for file name)
                    var data = _hardDrive.read(TSB).split("").slice(4);
                    var compareData = '';
                    //Create comparison data
                    for(var i = 0; i < hexFileNameList.length; i++){
                        compareData += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for(var x = compareData.length-1; x < 59; x++){
                        compareData += '0';
                    }
                    //If they are the same, then the file has already been created
                    if(data.join("") == compareData){
                        return 0;
                    }
                }else if(validInvalidBit == '0' && i > 0){ //Found an empty not in use file
                    //Get empty data block and changed its bit to 1
                    var emptyDataTSB = this.krnHDDFindEmptyDataBlock();
                    var emptyData = _hardDrive.read(emptyDataTSB);
                    var emptyDataArray = emptyData.split("");
                    emptyDataArray[0] = '1';
                    emptyData = emptyDataArray.join("");
                    _hardDrive.write(emptyDataTSB, emptyData);
                    //Create data for file(For some reason I have to use different variable names for compiling to work)
                    var data2 = '1'+emptyDataTSB;
                    console.log(data2);
                    for(var i = 0; i < hexFileNameList.length; i++){
                        data2 += hexFileNameList[i];
                    }
                    //Append 0s to the end of file name
                    for(var i = data2.length-1; i < 63; i++){
                        data2 += '0';
                    }
                    //Write to HDD and update HDD Table
                    _hardDrive.write(TSB, data2);
                    this.updateHDDTable();
                    return 1;
                }
            }
        }

        public krnHDDWriteFile(filename, data){
            //See how many bytes the data is when converted to hex
            //Change data to hex
            var newData = data.split("");
            var hexData = [];
            console.log(hexData);
            for(var i = 0; i < newData.length; i++){
                hexData.push(newData[i].charCodeAt(0).toString(16));
            }
            //Convert to string to find how many bytes it is, and if you need to link files
            var hexDataString = hexData.join("");
            //Find out if you need to link the file, if so how many times
            var linkCount = 1;
            //Can not be more than 60 bytes
            if(hexDataString.length > 60){
                //Round up
                linkCount = Math.ceil(hexDataString.length/60);
            }
            //Split string back into array to make life easier
            hexData = hexDataString.split("");
            var hexDataCount = 0;

            //Get current TSB from file data
            var TSB = this.krnHDDFindFileBlock(filename);
            var currentTSBData = _hardDrive.read(TSB);
            var currentTSBDataArray = currentTSBData.split("");
            TSB = '';
            TSB += currentTSBDataArray[1];
            TSB += currentTSBDataArray[2];
            TSB += currentTSBDataArray[3];
            
            //Clear TSBs in case of updating the same file
            var tempTSB = TSB; //Use for clearing data
            var clearTSBList = [tempTSB]
            while(true){
                var TSBData = _hardDrive.read(tempTSB);
                if(TSBData.split("")[1] != '-'){
                    tempTSB = ''
                    tempTSB += TSBData.split("")[1]
                    tempTSB += TSBData.split("")[2]
                    tempTSB += TSBData.split("")[3]
                    clearTSBList.push(tempTSB);
                }else{
                    break;
                }
            }
            if(clearTSBList.length != 0){
                console.log(clearTSBList)
                for(var i = 0; i < clearTSBList.length; i++){
                    this.krnHDDClearTSB(clearTSBList[i]);
                }
            }

            //Write to the file
            for(var i = 0; i < linkCount; i++){
                var x = 0;
                //Start with 1 for invalid/valid bit
                var inputData = '1';

                //Must quickly make the current TSB bit to 1 so the linkage will be incremented
                currentTSBData = _hardDrive.read(TSB);
                var currentTSBDataArray = currentTSBData.split("");
                currentTSBDataArray[0] = '1';
                _hardDrive.write(TSB, currentTSBDataArray.join(""));

                //If there is no other link, do not fill link TSB
                if(i === linkCount-1){
                    inputData += '---';
                }else{//Otherwise, link
                    inputData += this.krnHDDFindEmptyDataBlock();
                }
                while(x < 60){
                    if(hexDataCount >= hexData.length){
                        inputData += '0'
                    }else{
                        inputData += hexData[hexDataCount];
                        hexDataCount++;
                    }
                    x++;
                }
                _hardDrive.write(TSB, inputData);
                TSB = this.krnHDDFindEmptyDataBlock();
            }
            this.updateHDDTable()            
        }

        public krnHDDCheckFileExists(fileName){
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for(var i = 0; i < newFileName.length; i++){
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16))
            }
            //Loop through all of the TSBs
            for(var j = 0; j < _hardDrive.TSBList.length; j++){
                var TSB = _hardDrive.TSBList[j];
                //It has reached the end and no file exists
                if(TSB === "100"){
                    return false;
                }
                //Create comparison data
                //Get file data, use slice to not account for the possible linkage(just looking for file name)
                var data = _hardDrive.read(TSB).split("").slice(4);
                var compareData = '';
                //Create comparison data
                for(var x = 0; x < hexFileNameList.length; x++){
                    compareData += hexFileNameList[x];
                }
                //Append 0s to the end of file name
                for(var y = compareData.length-1; y < 59; y++){
                    compareData += '0';
                }
                //If they are the same, then the file has already been created
                if(data.join("") == compareData){
                    return true;
                }
            }
        }

        //Read file
        public krnHDDReadFile(fileName){
            debugger;
            //Get the current file TSB
            var fileTSB = this.krnHDDFindFileBlock(fileName);
            var fileTSBArray = _hardDrive.read(fileTSB).split("");
            //Create the initial data block TSB
            var dataTSB = '';
            dataTSB += fileTSBArray[1];
            dataTSB += fileTSBArray[2];
            dataTSB += fileTSBArray[3];
            //Get all the TSBs you must retrieve data from
            var dataTSBList = [dataTSB];
            while(true){
                var TSBData = _hardDrive.read(dataTSB);
                if(TSBData.split("")[1] != '-'){
                    dataTSB = ''
                    dataTSB += TSBData.split("")[1]
                    dataTSB += TSBData.split("")[2]
                    dataTSB += TSBData.split("")[3]
                    dataTSBList.push(dataTSB);
                }else{
                    break;
                }
            }
            var hexDataList = []
            for(var i = 0; i < dataTSBList.length; i++){
                //Get all the data and not the first 4 bits
                hexDataList.push(_hardDrive.read(dataTSBList[i]).split("").slice(4));
            }
            console.log(hexDataList);
        }

        //Clear TSB
        public krnHDDClearTSB(TSB){
            var emptyData = '';

            //Create Empty Data
            for(var i = 0; i < 64; i++){
                if(i >= 1 && i <= 3){
                    emptyData += '-';        
                }else{
                    emptyData += '0';
                }
            }
            //Clear that TSB
            _hardDrive.write(TSB, emptyData);
        }

        //Find empty file block
        public krnHDDFindFileBlock(fileName){
            //Change file name letters to hex
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for(var i = 0; i < newFileName.length; i++){
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16))
            }
            //Loop through all of the TSBs
            for(var j = 0; j < _hardDrive.TSBList.length; j++){
                var TSB = _hardDrive.TSBList[j];
                //Create comparison data
                //Get file data, use slice to not account for the possible linkage(just looking for file name)
                var data = _hardDrive.read(TSB).split("").slice(4);
                var compareData = '';
                //Create comparison data
                for(var x = 0; x < hexFileNameList.length; x++){
                    compareData += hexFileNameList[x];
                }
                //Append 0s to the end of file name
                for(var y = compareData.length-1; y < 59; y++){
                    compareData += '0';
                }
                //If they are the same, then the file has already been created
                if(data.join("") == compareData){
                    return TSB;
                }
            }
        }

        //Find empty data block
        public krnHDDFindEmptyDataBlock(){
            //Find first empty data block
            var start = 0;
            //Get the start of the file TSB
            for(var i = 0; i < _hardDrive.TSBList.length; i++){
                if(_hardDrive.TSBList[i] == '100'){
                    start = i;
                    break;
                }
            }
            for(var i = start; i < _hardDrive.TSBList.length; i++){
                //Find first open block
                if(_hardDrive.read(_hardDrive.TSBList[i]).split("")[0] == '0'){
                    return _hardDrive.TSBList[i];
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
