///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {
        //Memory is an array but only location 0000 is here, temporary...
        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public operations = [],
                    public PID: number = -1,
                    public pastPID = [],
                    public memory = [0]) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');  
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var input = (<HTMLInputElement>document.getElementById("taProgramInput")).value; //Op Codes

            if(this.PID != -1){
                var operation = this.operations[this.PID];
                var x = true;
                while(x == true){ //Loop to go through each OP code in the operation
                    this.isExecuting = true; //CPU cycle begins
                    if(operation.substring(0,2) == 'A9'){ //Load accumulator
                        this.loadAccumulator(operation.substring(4,6));
                        operation = operation.substring(6, operation.length); //Crop operation string to continue looping through
                    }else if(operation.substring(0,2) == 'A2'){ //Load X register
                        this.loadXRegister(operation.substring(4,6));
                        operation = operation.substring(6, operation.length); //Crop operation string to continue looping through
                    }else if(operation.substring(0,2) == 'A0'){ //Load Y register
                        this.loadYRegister(operation.substring(4,6));
                        operation = operation.substring(6, operation.length); //Crop operation string to continue looping through
                    }else if(operation.substring(0,2) == '8D'){ //Store accumulator into memory
                        this.storeAccumulator(operation.substring(3, 8)); //Send location to function
                        operation = operation.substring(9, operation.length); //Crop operation string to continue looping through
                    }else if(operation.substring(0,2) == 'AE'){ //Load X register from memory
                        this.loadXRegisterMem(operation.substring(3, 8)); //Send location to function
                        operation = operation.substring(9, operation.length);
                    }else if(operation.substring(0,2) == 'AC'){ //Load Y register from memory
                        this.loadYRegisterMem(operation.substring(3, 8)); //Send location to function
                        operation = operation.substring(9, operation.length);
                    }else{ //If there are no more op codes, reset IR, and leave loop
                        var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                        table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '00'; //Reset IR
                        console.log(this.memory[0]);
                        x = false;
                    }
                    
                }
                this.isExecuting = false;
                this.pastPID.push(this.PID); //Push to past PID list so you don't run a program that has been executed already
            }
            this.PID = -1; //Change back to normal            
        }

        //Loads a constant in the accumulator(OP Code A9)
        public loadAccumulator(constant){
            if(constant != ''){ //Check that there is a constant to save
                //Change HTML CPU Display
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A9'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[1].innerHTML = constant; //Acc
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Acc = parseInt(constant); //Store constant in accumulator
                this.isExecuting = false; //CPU Cycle Done
            } 
        }

        //Loads a constant in X register(OP Code A2)
        public loadXRegister(constant){
            if(constant != ''){ //Check that there is a constant to save
                //Change HTML CPU Display
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A2'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[3].innerHTML = constant;
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Xreg = parseInt(constant); //Store constant in X Register
                this.isExecuting = false; //CPU Cycle Done
            } 
        }

        //Loads a constant in the Y register(OP Code A0)
        public loadYRegister(constant){
            if(constant != ''){ //Check that there is a constant to save
                //Change HTML CPU Display
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'A0'; //IR
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[4].innerHTML = constant;
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Xreg = parseInt(constant); //Store constant in Y Register
                this.isExecuting = false; //CPU Cycle Done
            } 
        }

        //Store accumulator into specific memory location(OP Code 8D)
        public storeAccumulator(location){
            if(location != ''){//Check that there is a location to store the accumulator in
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = '8D'; //IR
                if(location == '00 00'){ //0000 Memory Location(First in Matrix)
                    this.memory[0] = this.Acc;
                }
            }
        }

        //Loads X register from memory(OP Code AE)
        public loadXRegisterMem(location){
            if(location != ''){
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'AE'; //IR
                if(location == '00 00'){

                    this.loadXRegister(this.memory[0]); //Load the X Register from the memory
                }
            }
        }

        //Loads Y register from memory(OP Code AC)
        public loadYRegisterMem(location){
            if(location != ''){
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[2].innerHTML = 'AC'; //IR
                if(location == '00 00'){
                    this.loadYRegister(this.memory[0]); //Load the Y Register from the memory
                }
            }
        }
    }
}
