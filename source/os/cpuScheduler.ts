///<reference path="../globals.ts" />

module TSOS{
	export class cpuScheduler{
		//The plan for the cpu Scheduler is to use arrays and indexes to keep track of whats running and what isnt
		//Use count to check if it is up to the quantum, if so, context switch
		//False for not running in the readyQueue and is ready to run, true for running
		constructor(public quantum = 6,
					public count = 0,
					public RR = false,
					public residentList = [-1,-1,-1],
					public PCList = [-1,-1,-1],
					public readyQueue = [false, false, false],
					public readyQueue2 = new Queue(),
					public residentList2 = []){}


		public contextSwitch(){
			//Round Robin Scheduling
			if(this.RR){

			}
		}

		//This function is used along with the clearmem command to clear everything in the scheduler as well
		public clearMem(){
			this.residentList = [-1,-1,-1];
			this.PCList = [-1,-1,-1];
			this.readyQueue = [false,false,false];
		}

		//This function is used to keep track of the PC of each running program, the count/quantum comparison, 
		public updatePCList(PC, PID){
			//Update the PC 
			for(var i = 0; i < this.residentList.length; i++){
				if(this.residentList[i] == PID){
					this.PCList[i] = PC;
				}
			}
			this.count++; //Increment count
			//Check if count and quantum are the same, if so a context switch is needed
			if(this.count == this.quantum){
				this.contextSwitch();
			}
		}
	}
}