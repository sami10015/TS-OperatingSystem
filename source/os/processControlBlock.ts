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
					public Part = 0){}

		public displayPCB(State){
			var table = (<HTMLInputElement>document.getElementById("PCB_Table"));
			var row = table.getElementsByTagName("tr")[1];
			row.getElementsByTagName("td")[0].innerHTML = this.getPID() + '';
			row.getElementsByTagName("td")[1].innerHTML = State;
			row.getElementsByTagName("td")[2].innerHTML = this.getPC() + '';
			row.getElementsByTagName("td")[3].innerHTML = this.getAcc() + '';
			row.getElementsByTagName("td")[4].innerHTML = this.IR;
			row.getElementsByTagName("td")[5].innerHTML = this.getXReg() + '';
			row.getElementsByTagName("td")[6].innerHTML = this.getYReg() + '';
			row.getElementsByTagName("td")[7].innerHTML = this.getZFlag() + '';
			row.getElementsByTagName("td")[8].innerHTML = this.getBase(this.PID) + '';
			row.getElementsByTagName("td")[8].innerHTML = this.getLimit(this.PID) + '';
			row.getElementsByTagName("td")[9].innerHTML = this.getPart(this.PID) + '';
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
			this.Y = _CPU.YReg;
			return _CPU.YReg;
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
				this.Limit = 756;
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