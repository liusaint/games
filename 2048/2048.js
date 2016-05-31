function G2048(){
	this.addEvent();
}

G2048.prototype = {
	constructor:G2048,
	init:function(){
		this.score = 0;
		this.arr = [];
		this.moveAble = false;
		$("#score").html("分数：0");
		$(".number_cell").remove();
		this.creatArr();
	},
	creatArr:function(){
		/*生成原始数组,随机创建前两个格子*/
		var i,j;
		for (i = 0; i < 4; i++) {
			this.arr[i] = [];
			for (j = 0; j < 4; j++) {
				this.arr[i][j] = {};
				this.arr[i][j].value = 0;
			}
		}
		//随机生成前两个。并且不重复。
		var i1,i2,j1,j2;
		do{
			i1=getRandom(3),i2=getRandom(3),j1=getRandom(3),j2=getRandom(3);
		}while(i1==i2 && j1 == j2);

		this.arrValueUpdate(2,i1,j1);
		this.arrValueUpdate(2,i2,j2);
		this.drawCell(i1,j1);
		this.drawCell(i2,j2);
	},
	drawCell:function(i,j){
		/*画一个新格子*/
		var item = '<div class="number_cell p'+i+j+'" ><div class="number_cell_con n2"><span>'
		+this.arr[i][j].value+'</span></div> </div>';		
		$(".g2048").append(item);
	},
	addEvent:function(){
		//添加事件。
		var that = this;
		document.onkeydown=function(event){
			var e = event || window.event || arguments.callee.caller.arguments[0];
			var direction = that.direction;
			var keyCode = e.keyCode;

			switch(keyCode){
				case 39://右
				that.moveAble = false;
				that.moveRight();
				that.checkLose();
				break;
				case 40://下
				that.moveAble = false;
				that.moveDown();
				that.checkLose();
				break;
				case 37://左
				that.moveAble = false;
				that.moveLeft();
				that.checkLose();
				break;
				case 38://上
				that.moveAble = false;
				that.moveUp();
				that.checkLose();
				break;
			}
		}; 
	},
	arrValueUpdate:function(num,i,j){
		/*更新一个数组的值。*/
		this.arr[i][j].oldValue = this.arr[i][j].value;
		this.arr[i][j].value = num;
	},
	newCell:function(){
		/*在空白处掉下来一个新的格子*/
		var i,j,len,index;
		var ableArr = [];
		if(this.moveAble != true){
			console.log('不能增加新格子，请尝试其他方向移动！');
			return;
		}
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if(this.arr[i][j].value == 0){
					ableArr.push([i,j]);
				}
			}
		}
		len = ableArr.length;
		if(len > 0){
			index = getRandom(len);
			i = ableArr[index][0];
			j = ableArr[index][1];
			this.arrValueUpdate(2,i,j);
			this.drawCell(i,j);
		}else{
			console.log('没有空闲的格子了！');
			return;
		}

	},
	moveDown:function(){
		/*向下移动*/
		var i,j,k,n;
		for (i = 0; i < 4; i++) {
			n = 3;
			for (j = 3; j >= 0; j--) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = j+1;
				aa:
				while(k<=n){
					if(this.arr[i][k].value == 0){
						if(k == n || (this.arr[i][k+1].value!=0 && this.arr[i][k+1].value!=this.arr[i][j].value)){
							this.moveCell(i,j,i,k);
						}
						k++;
						
					}else{
						if(this.arr[i][k].value == this.arr[i][j].value){
							this.mergeCells(i,j,i,k);
							n--;
						}
						break aa;
					}

				}
			}
		}
		this.newCell();//生成一个新格子。后面要对其做判断。
	},
	moveUp:function(){
		/*向上移动*/
		var i,j,k,n;
		for (i = 0; i < 4; i++) {
			n=0;
			for (j = 0; j < 4; j++) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = j-1;
				aa:
				while(k>=n){
					if(this.arr[i][k].value == 0){
						if(k == n || (this.arr[i][k-1].value!=0 && this.arr[i][k-1].value!=this.arr[i][j].value)){
							this.moveCell(i,j,i,k);
						}
						k--;						
					}else{
						if(this.arr[i][k].value == this.arr[i][j].value){
							this.mergeCells(i,j,i,k);
							n++;
						}
						break aa;
					}

				}
			}
		}
		this.newCell();//生成一个新格子。后面要对其做判断。
	},
	moveLeft:function(){
		/*向左移动*/
		var i,j,k,n;

		for (j = 0; j < 4; j++) {
			n=0;
			for (i = 0; i < 4; i++) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k=i-1;
				aa:
				while(k>=n){
					if(this.arr[k][j].value == 0){
						if(k == n || (this.arr[k-1][j].value!=0 && this.arr[k-1][j].value!=this.arr[i][j].value)){
							this.moveCell(i,j,k,j);
						}
						k--;	
					}else{
						if(this.arr[k][j].value == this.arr[i][j].value){
							this.mergeCells(i,j,k,j);
							n++;
						}
						break aa;

					}
				}
			}
		}
		this.newCell();//生成一个新格子。后面要对其做判断。
	},
	moveRight:function(){
		/*向右移动*/
		var i,j,k,n;
		for (j = 0; j < 4; j++) {
			n = 3;
			for (i = 3; i >= 0; i--) {
				if(this.arr[i][j].value==0){					
					continue;
				}
				k = i+1;
				aa:
				while(k<=n){
					if(this.arr[k][j].value == 0){
						if(k == n || (this.arr[k+1][j].value!=0 && this.arr[k+1][j].value!=this.arr[i][j].value)){
							this.moveCell(i,j,k,j);
						}
						k++;


					}else{
						if(this.arr[k][j].value == this.arr[i][j].value){
							this.mergeCells(i,j,k,j);
							n--;
						}
						break aa;
					}
				}
			}
		}

		this.newCell();//生成一个新格子。后面要对其做判断。
	},
	mergeCells:function(i1,j1,i2,j2){
		/*移动并合并格子*/
		var temp =this.arr[i2][j2].value;
		var temp1 = temp * 2;
		this.moveAble = true;
		this.arr[i2][j2].value = temp1;
		this.arr[i1][j1].value = 0;
		$(".p"+i2+j2).addClass('toRemove');
		var theDom = $(".p"+i1+j1).removeClass("p"+i1+j1).addClass("p"+i2+j2).find('.number_cell_con');
		setTimeout(function(){
			$(".toRemove").remove();//这个写法不太好
			theDom.addClass('n'+temp1).removeClass('n'+temp).find('span').html(temp1);
		},200);//200毫秒是移动耗时。
		this.score += temp1;
		$("#score").html("分数："+this.score);	
		if(temp1 == 2048){
			alert('you win!');
			this.init();
		}	
	},
	moveCell:function(i1,j1,i2,j2){
		/*移动格子*/
		this.arr[i2][j2].value = this.arr[i1][j1].value;
		this.arr[i1][j1].value = 0;
		this.moveAble = true;
		$(".p"+i1+j1).removeClass("p"+i1+j1).addClass("p"+i2+j2);
	},
	checkLose:function(){
		/*判输*/
		var i,j,temp;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				temp = this.arr[i][j].value;
				if(temp == 0){
					return false;
				}
				if(this.arr[i+1] && (this.arr[i+1][j].value==temp)){
					return false;
				}
				if((this.arr[i][j+1]!=undefined) && (this.arr[i][j+1].value==temp)){
					return false;
				}
			}
		}
		alert('you lose!');
		this.init();
		return true;
	}
}

//生成随机正整数 0到n之间。
function getRandom(n){
	return Math.floor(Math.random()*n)
}


var g = new G2048();
g.init();




// 剩下的问题：
// 1.一次把一排加完了的问题。
// 2.随机出现下一位的循环问题。连续按键的问题 已ok.
// 3.某些情况下应该不能出现新的的问题。
// 4.判输。
// 5.样式。
// 6.计分。