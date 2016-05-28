function G2048(){
	this.arr = [];

}

G2048.prototype = {
	constructor:G2048,
	init:function(){

	},
	creatArr:function(){
		/*生成原始数组*/
		var i,j;
		for (i = 0; i < 4; i++) {
			this.arr[i] = [];
			for (j = 0; j < 4; j++) {
				this.arr[i][j] = {};
				this.arr[i][j].value = 0;
				this.arr[i][j].oldValue = 0;
				this.arr[i][j].oldi = i;
				this.arr[i][j].oldj = j;
				this.arr[i][j].i = i;
				this.arr[i][j].j = j;
			}
		}
		this.arrValueUpdate(2,0,3);
		this.arrValueUpdate(2,1,3);
		this.drawCell(0,3);
		this.drawCell(1,3);
	},
	drawCell:function(i,j){
		/*画一个新格子*/
		var item = '<div class="number_cell p'+i+j+'" ><div class="number_cell_con n2">'
		+this.arr[i][j].value+'</div> </div>';		
		$(".g2048").append(item);
	},
	addEvent:function(){
		//更换移动方向。下一步的移动方向。
		var that = this;
		document.onkeydown=function(event){
			var e = event || window.event || arguments.callee.caller.arguments[0];
			var direction = that.direction;
			var keyCode = e.keyCode;

			switch(keyCode){
				case 39://右
				that.moveRight();
				break;
				case 40://下
				that.moveDown();
				break;
				case 37://左
				that.moveLeft();
				break;
				case 38://上
				that.moveUp();
				break;

				default:
				break;
			}
		}; 
	},
	arrValueUpdate:function(num,i,j){
		/*更新一个数组的值。*/
		this.arr[i][j].oldValue = this.arr[i][j].value;
		this.arr[i][j].value = num;
	},
	newCellValue:function(){
		/*在空白处掉下来一个新的格子，目前这个方法还有点慢*/
		var i,j;
		do{
			i = getRandom(4);
			j = getRandom(4);
		}while(this.arr[i][j].value != 0)

		this.arrValueUpdate(2,i,j);
		this.drawCell(i,j);
	},
	moveDown:function(){
		/*向下移动*/
		var i,j,k;
		for (i = 0; i < 4; i++) {
			for (j = 3; j >= 0; j--) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = j+1;
				aa:
				while(k<4){
					if(this.arr[i][k].value == 0){
						if(k == 3 || (this.arr[i][k+1].value!=0 && this.arr[i][k+1].value!=this.arr[i][j].value)){
							this.moveCell(i,j,i,k);
						}
						k++;
						
					}else{
						if(this.arr[i][k].value == this.arr[i][j].value){
							this.mergeCells(i,j,i,k);
						}
						break aa;
					}

				}
			}
		}
		this.newCellValue();//生成一个新格子。后面要对其做判断。
	},
	moveUp:function(){
		/*向上移动*/
		var i,j,k;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = j-1;
				aa:
				while(k>=0){
					if(this.arr[i][k].value == 0){
						if(k == 0 || (this.arr[i][k-1].value!=0 && this.arr[i][k-1].value!=this.arr[i][j].value)){
							this.moveCell(i,j,i,k);
						}
						k--;						
					}else{
						if(this.arr[i][k].value == this.arr[i][j].value){
							this.mergeCells(i,j,i,k);
						}
						break aa;
					}

				}
			}
		}
		this.newCellValue();//生成一个新格子。后面要对其做判断。
	},
	moveLeft:function(){
		/*向左移动*/
		var i,j,k;

		for (j = 0; j < 4; j++) {
			for (i = 0; i < 4; i++) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k=i-1;
				aa:
				while(k>=0){
					if(this.arr[k][j].value == 0){
						if(k == 0 || (this.arr[k-1][j].value!=0 && this.arr[k-1][j].value!=this.arr[i][j].value)){
							this.moveCell(i,j,k,j);
						}
						k--;	
					}else{
						if(this.arr[k][j].value == this.arr[i][j].value){
							this.mergeCells(i,j,k,j);
						}
						break aa;

					}
				}
			}
		}
		this.newCellValue();//生成一个新格子。后面要对其做判断。
	},
	moveRight:function(){
		/*向右移动*/
		var i,j,k;
		for (j = 0; j < 4; j++) {
			for (i = 3; i >= 0; i--) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = i+1;
				aa:
				while(k<4){
					if(this.arr[k][j].value == 0){

						if(k == 3 || (this.arr[k+1][j].value!=0 && this.arr[k+1][j].value!=this.arr[i][j].value)){
							this.moveCell(i,j,k,j);
						}
						k++;


					}else{
						if(this.arr[k][j].value == this.arr[i][j].value){
							this.mergeCells(i,j,k,j);
						}
						break aa;


					}
				}
			}
		}

		this.newCellValue();//生成一个新格子。后面要对其做判断。
	},
	mergeCells:function(i1,j1,i2,j2){
		/*移动并合并格子*/
		var temp =this.arr[i2][j2].value;
		var temp1 = temp * 2;
		this.arr[i2][j2].value = temp1;
		this.arr[i1][j1].value = 0;
		$(".p"+i2+j2).remove();//这个写法不太好
		$(".p"+i1+j1).removeClass("p"+i1+j1).addClass("p"+i2+j2).find('.number_cell_con').html(this.arr[i2][j2].value).addClass('n'+temp1).removeClass('n'+temp);
	},
	moveCell:function(i1,j1,i2,j2){
		this.arr[i2][j2].value = this.arr[i1][j1].value;
		this.arr[i1][j1].value = 0;
		$(".p"+i1+j1).removeClass("p"+i1+j1).addClass("p"+i2+j2).find('.number_cell_con');
	}
}

//生成随机正整数 1到n之间。
function getRandom(n){
	return Math.floor(Math.random()*n)
}


var g = new G2048();
g.creatArr();
g.addEvent();