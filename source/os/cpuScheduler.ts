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
				if(tempPCB.State != "TERMINATED"){
					_PCB = tempPCB;
					this.readyQueue.enqueue(tempPCB);
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
				this.count = 0;
				this.contextSwitch();
			}
		}
	}
}