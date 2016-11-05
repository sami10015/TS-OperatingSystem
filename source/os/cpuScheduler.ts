///<reference path="../globals.ts" />
///<reference path="queue.ts" />

module TSOS{
	export class cpuScheduler{
		constructor(public quantum = 6,
					public count = 1,
					public RR = false,
					public residentList = [],
					public readyQueue = new Queue(),
					public turnaroundTime = 0){}


		public contextSwitch(){
			//Round Robin Scheduling
			if(this.RR){
				if(this.readyQueue.isEmpty()){
					_CPU.isExecuting = false;
					(<HTMLButtonElement>document.getElementById("btnSingleStepToggle")).value = "Single Step: Off";
	                (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
	                _SingleStepMode = false;
					this.clearMem();
				}else{
					if(_PCB.State != "TERMINATED"){
						_PCB.State = "Ready";
						this.readyQueue.enqueue(_PCB);
					}
					_PCB = this.readyQueue.dequeue();
					_PCB.State = "Running";
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
			_PCB.State = "Running";
		}

		//Increment counters, if equal to quantum, context switch
		public checkCount(){
			//this.turnaroundTime++;
			if(this.count < this.quantum){
				this.count++
			}else{
				this.count = 1;
				_KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 'Scheduling Event')); //Call An Interrupt
			}
		}

		//Function to display PCBs in Ready Queue
		public displayReadyQueue(){
			var table = (<HTMLTableElement>document.getElementById("PCB_Table"));
			if(table.rows.length == 1){
				for(var i = 1; i < this.readyQueue.getSize()+1; i++){
				var tempPCB = this.readyQueue.q[i]; //Get PCB from Ready Queue without dequeing
				var row = table.insertRow(i);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
		        var cell3 = row.insertCell(2);
		        var cell4 = row.insertCell(3);
		        var cell5 = row.insertCell(4);
		        var cell6 = row.insertCell(5);
		        var cell7 = row.insertCell(6);
		        var cell8 = row.insertCell(7);
		        var cell9 = row.insertCell(8);
		        var cell10 = row.insertCell(9);
		        var cell11 = row.insertCell(10);

		        cell1.innerHTML = tempPCB.PID;
		        cell2.innerHTML = tempPCB.State;
		        cell3.innerHTML = tempPCB.PC;
		        cell4.innerHTML = tempPCB.AC;
		        cell5.innerHTML = tempPCB.IR;
		        cell6.innerHTML = tempPCB.X;
		        cell7.innerHTML = tempPCB.Y;
		        cell8.innerHTML = tempPCB.Z;
		        cell9.innerHTML = tempPCB.getBase(tempPCB.PID);
		        cell9.innerHTML = tempPCB.getLimit(tempPCB.PID);
		        cell10.innerHTML = tempPCB.getPart(tempPCB.PID);

		    	}
			}
		}

	}
}