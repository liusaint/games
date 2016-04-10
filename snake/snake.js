/**
* author:ls
* email:liusaint@gmail.com
* date:2016年1月
*/
var Snake = function(ele,scoreele,speedele,x,y){

	this.cellWidth = 10;//每个格子的大小
	this.ele = document.getElementById(ele);
	this.cxt = this.ele.getContext("2d");
	this.x=x;
	this.y=y;
	this.scoreele = document.getElementById(scoreele);
	this.speedele = document.getElementById(speedele);

	//生成canvas大小。边框。
	this.ele.width = this.cellWidth * this.x;
	this.ele.height = this.cellWidth * this.y;
	this.ele.style.border ="1px solid #000";

	this.changeDiretion();//绑定方向事件。
}

Snake.prototype = {

	init:function(){
		//初始化，重置。恢复js数据以及dom。

		this.direction = 1;//向右  2下 3左  4 上
		this.nextDirection = '';
		this.snakeArr = [[0,parseInt(this.y/2)],[1,parseInt(this.y/2)]];
		this.speed = 1;
		this.score = 0;

		this.cxt.fillStyle ='#fff';
		this.cxt.fillRect(0,0,this.cellWidth*this.x,this.cellWidth*this.y);
		this.scoreele.innerHTML="得分：0";
		this.speedele.innerHTML="速度：1";

		this.createCoolPoint();
		this.drawCell(this.coolPoint,2);
		this.drawSnake();
		this.setTimer();
	},
	getCellArea:function(pos){//返回一个格子左上角的像素坐标[32,666];		
		return [(pos[0]-1)*this.cellWidth+1,(pos[1]-1)*this.cellWidth+1];
	},
	setTimer:function(){
		var speedArr = [900,800,700,600,500,400,300,200,100];
		var speed = this.speed;
		if(speed>8){
			speed = 8;
		}
		(function(theThis){
			var that = theThis;
			that.timer = setTimeout(function() {
				that.moveSnake();			
			}, speedArr[speed]);
		})(this);

	},
	moveSnake:function(){
		//移动蛇的逻辑。数组处理。

		this.direction = this.nextDirection == ''?this.direction:this.nextDirection;//当前移动方向，和下一个移动方向。这样处理能避免一个bug.
		var direction = this.direction;
		var snakeArr = this.snakeArr;
		var snakeHead = snakeArr[snakeArr.length-1];
		switch(direction){
			case 1 ://向右
			snakeHead = [snakeHead[0]+1,snakeHead[1]];
			break;
			case 2 ://向下
			snakeHead = [snakeHead[0],snakeHead[1]+1];
			break;
			case 3 ://向左
			snakeHead = [snakeHead[0]-1,snakeHead[1]];
			break;
			case 4 ://向上
			snakeHead = [snakeHead[0],snakeHead[1]-1];
			break;
		}

		//超界，或撞上自己。结束，重置。
		if(in_array(snakeHead,snakeArr) || snakeHead[0]<0 || snakeHead[0]>this.x || snakeHead[1]<0 || snakeHead[1]>this.y){
			window.clearInterval(this.timer);
			alert('胜败乃兵家常事 大侠请重新来过。得分：'+this.score);
			this.init();
			return;
		}

		 snakeArr.push(snakeHead);//将蛇头放入数组


		 this.drawCell(snakeHead,1);
		 if(snakeHead.toString() != this.coolPoint.toString()){
			var tail = snakeArr.shift();//移除蛇尾。
			this.drawCell(tail,0);

		}else{//撞到coolPoint
			this.createCoolPoint();
			this.drawCell(this.coolPoint,2);
			this.score = this.score + 10;
			this.scoreele.innerHTML="得分："+this.score;
			this.speed =  Math.ceil((this.score + 1)/100);
			this.speedele.innerHTML="速度："+this.speed;
		}

		this.setTimer();

	},

	createCoolPoint:function(){//随机生成coolPoint,不在代表snakeArr的数组中。		
		do{
			this.coolPoint = [getRandom(this.x),getRandom(this.y)];
		}while(in_array(this.coolPoint,this.snakeArr));
	},
	changeDiretion:function(){
		//更换移动方向。下一步的移动方向。
		var that = this;
		document.onkeydown=function(event){
			var e = event || window.event || arguments.callee.caller.arguments[0];
			var direction = that.direction;
			var keyCode = e.keyCode;

			switch(keyCode){
				case 39://右
				if(direction!=1 && direction !=3){
					that.nextDirection = 1;
				}

				break;
				case 40://下
				if(direction!=2 && direction !=4){
					that.nextDirection = 2;
				}
				break;
				case 37://左
				if(direction!=1 && direction !=3){
					that.nextDirection = 3;
				}
				break;
				case 38://上
				if(direction!=2 && direction !=4){
					that.nextDirection = 4;
				}
				break;

				default:
				break;
			}
		}; 
	},
	drawSnake:function(){
		//绘制初始小蛇。
		var snakeArr = this.snakeArr;
		for (var i = 0,sLen=snakeArr.length; i < sLen; i++) {
			this.drawCell(snakeArr[i],1);
		};

	},
	drawCell:function(pos,type){//绘制会用到的几种颜色的图。

		var colorArr = ['#fff','rgb(0,140,202)',"red"];
		var cxt = this.cxt;
		var area;
		cxt.fillStyle = colorArr[type];
		area = this.getCellArea(pos);
		cxt.fillRect(area[0],area[1],this.cellWidth-1,this.cellWidth-1);
	}
}


//生成随机正整数 1到n之间。
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//判断一个数组是否在另一个数组中。注意toString()
function in_array(stringToSearch, arrayToSearch) {
	for (s = 0; s < arrayToSearch.length; s++) {
		thisEntry = arrayToSearch[s].toString();
		if (thisEntry == stringToSearch.toString()) {
			return true;
		}
	}
	return false;
}

//bug1:很快的按上下左右 会出现问题。已解决。