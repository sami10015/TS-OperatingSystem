///<reference path="../globals.ts" />
///<reference path="queue.ts" />

module TSOS{
	export class cpuScheduler{
		constructor(public quantum = 6,
					public count = 0,
					public RR = false,
					public residentList = [],
					public readyQueue = new Queue()){}


		public contextSwitch(){
			//Round Robin Scheduling
			if(this.RR){
				var tempPCB = this.readyQueue.dequeue();
				var termination = false;
				//If the current PCB isn't finished yet, put it back on the ready queue
				if(_PCB.State != "TERMINATED"){
					this.readyQueue.enqueue(_PCB);
				}
				while(!termination){
					if(this.readyQueue.isEmpty()){
						_CPU.isExecuting = false;
						termination = true;
					}
					if(tempPCB.State == "TERMINATED"){
						tempPCB = this.readyQueue.dequeue();
					}else{
						_PCB = tempPCB;
						break;
					}
				}
			}
		}

		//This function is used along with the clearmem command to clear everything in the scheduler
		public clearMem(){
			this.RR = false;
			this.readyQueue.q = new Array();
		}

		//Fill up the ready queue with the PCBs loaded in the residentList when you do a runall
		public loadReadyQueue(){
			for(var i = 0; i < this.residentList.length; i++){
				if(this.residentList[i].State != "TERMINATED"){
					this.readyQueue.enqueue(this.residentList[i]);
				}
			}
		}

		//Increment counter, if equal to quantum, context switch
		public checkCount(){
			if(this.count < this.quantum){
				this.count++
			}else{
				this.contextSwitch();
				this.count = 0;
			}
		}
	}
}