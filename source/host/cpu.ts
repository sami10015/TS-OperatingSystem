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

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public operations = [],
                    public PID: number = -1,
                    public pastPID = []) {

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
                        operation = operation.substring(6, operation.length);
                    }
                    if(operation == ''){ //If there are no more op codes,leave loop
                        x = false;
                    }
                }
                this.isExecuting = false;
            }
            this.pastPID.push(this.PID);
            this.PID = -1; //Change back to normal            
        }

        public loadAccumulator(constant){
            if(constant != ''){ //Check that there is a constant to save
                //Change HTML CPU Display
                var table = (<HTMLInputElement>document.getElementById("cpuTable"));
                table.getElementsByTagName("tr")[1].getElementsByTagName("td")[1].innerHTML = constant;
                _Kernel.krnTrace('CPU cycle'); //Run CPU Cycle
                this.Acc = parseInt(constant); //Store constant in accumulator
                this.isExecuting = false; //CPU Cycle Done
            } 
        }
    }
}
