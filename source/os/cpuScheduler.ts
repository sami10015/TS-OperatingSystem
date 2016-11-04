///<reference path="../globals.ts" />
///<reference path="queue.ts" />

module TSOS{
	export class cpuScheduler{
		constructor(public quantum = 6,
					public count = 1,
					public RR = false,
					public residentList = [],
					public readyQueue = new Queue()){}


		public contextSwitch(){
			//Round Robin Scheduling
			if(this.RR){
				if(this.readyQueue.isEmpty()){
					_CPU.isExecuting = false;
					this.clearMem();
				}else{
					if(_PCB.State != "TERMINATED"){
						this.readyQueue.enqueue(_PCB);
					}
					_PCB = this.readyQueue.dequeue();
				}
			}
		}

		//This function is used along with the clearmem command to clear everything in the scheduler
		public clearMem(){
			this.RR = false;
			this.readyQueue.q = new Array();
			this.count = 1;
		}

		//Fill up the ready queue with the PCBs loaded in the residentList when you do a runall
		public loadReadyQueue(){
			for(var i = 0; i < this.residentList.length; i++){
				if(this.residentList[i].State != "TERMINATED"){
					this.readyQueue.enqueue(this.residentList[i]);
				}
			}
			_PCB = this.readyQueue.dequeue(); //Set the current PCB to the first item in the ready queue
		}

		//Increment counter, if equal to quantum, context switch
		public checkCount(){
			if(this.count < this.quantum){
				this.count++
			}else{
				this.count = 1;
				_KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event')); //Call An Interrupt
			}
		}
	}
}