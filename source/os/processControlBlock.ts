///<reference path="../globals.ts" />

module TSOS{
	export class PCB{
		constructor(public PID = -1,
					public State = '',
					public PC = 0,
					public AC = 0,
					public IR = '',
					public X = 0,
					public Y = 0,
					public Z = 0,
					public Base = 0,
					public Limit = 0,
					public Part = 0,
					public waitTime = 0,
					public rowNumber = 1,
					public priority = 0){}

		public init(PID, priority = 32){
			this.PID = PID;
			this.Base = this.getBase(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]);
			this.Limit = this.getLimit(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]);
            this.Part = this.getPart(_MemoryManager.PIDList[_MemoryManager.PIDList.length-1]);
            this.priority = priority;
		}

		public displayPCB(){
			var table = (<HTMLTableElement>document.getElementById("PCB_Table"));
			var row = table.getElementsByTagName("tr")[this.rowNumber];
			row.getElementsByTagName("td")[0].innerHTML = this.PID + '';
			row.getElementsByTagName("td")[1].innerHTML = this.State;
			row.getElementsByTagName("td")[2].innerHTML = (this.PC+this.Base) + '';
			row.getElementsByTagName("td")[3].innerHTML = this.AC + '';
			row.getElementsByTagName("td")[4].innerHTML = this.IR;
			row.getElementsByTagName("td")[5].innerHTML = this.X + '';
			row.getElementsByTagName("td")[6].innerHTML = this.Y + '';
			row.getElementsByTagName("td")[7].innerHTML = this.Z + '';
			row.getElementsByTagName("td")[8].innerHTML = this.getBase(this.PID) + '';
			row.getElementsByTagName("td")[9].innerHTML = this.getLimit(this.PID) + '';
			row.getElementsByTagName("td")[10].innerHTML = this.getPart(this.PID) + '';
		}

		public insertSingleRunRow(){
			var table = (<HTMLTableElement>document.getElementById("PCB_Table"));
			//Display current PCB
			var row = table.insertRow(this.rowNumber);
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

	        cell1.innerHTML = _PCB.PID + '';
	        cell2.innerHTML = _PCB.State;
	        cell3.innerHTML = _PCB.PC + '';
	        cell4.innerHTML = _PCB.AC + '';
	        cell5.innerHTML = _PCB.IR;
	        cell6.innerHTML = _PCB.X + '';
	        cell7.innerHTML = _PCB.Y + '';
	        cell8.innerHTML = _PCB.Z + '';
	        cell9.innerHTML = _PCB.getBase(_PCB.PID) + '';
	        cell9.innerHTML = _PCB.getLimit(_PCB.PID) + '';
	        cell10.innerHTML = _PCB.getPart(_PCB.PID) + '';
		}

		public clearPCB(){
			//Terminated PCB
			this.State = 'TERMINATED';
			var table = (<HTMLTableElement>document.getElementById("PCB_Table"));
			if(_cpuScheduler.fcfs){
				table.deleteRow(1);
			}else{
				table.deleteRow(this.rowNumber);
				//If multiple PCBs are in display
				if(_cpuScheduler.RR){
					_cpuScheduler.deIncrementRowNum();
				}
			}
		}

		public getPID(): number{
			this.PID = _CPU.PID;
			return _CPU.PID;
		}

		public getPC(): number{
			this.PC = _CPU.PC;
			return _CPU.PC;
		}

		public getAcc(): number{
			this.AC = _CPU.Acc;
			return _CPU.Acc;
		}

		public setIR(IR){
			this.IR = IR;
		}		

		public getXReg(): number{
			this.X = _CPU.Xreg;
			return _CPU.Xreg;
		}

		public getYReg(): number{
			this.Y = _CPU.Yreg;
			return _CPU.Yreg;
		}

		public getZFlag(): number{
			this.Z = _CPU.Zflag;
			return _CPU.Zflag;
		}

		public getBase(PID): number{
			var index = _MemoryManager.memoryIndex(PID);
			if(index == 0){
				this.Base = 0;
				return 0;
			}else if(index == 1){
				this.Base = 256;
				return 256;
			}else if(index == 2){
				this.Base = 512;
				return 512;
			}
		}

		public getLimit(PID): number{
			var index = _MemoryManager.memoryIndex(PID);
			if(index == 0){
				this.Limit = 256;
				return 256;
			}else if(index == 1){
				this.Limit = 512;
				return 512;
			}else if(index == 2){
				this.Limit = 768;
				return 768;
			}
		}

		public getPart(PID): number{
			var index = _MemoryManager.memoryIndex(PID);
			if(index == 0){
				this.Part = 1;
				return 1;
			}else if(index == 1){
				this.Part = 2;
				return 2;
			}else if(index == 2){
				this.Part = 3;
				return 3;
			}	
		}
	}
}