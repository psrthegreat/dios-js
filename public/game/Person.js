Person = function(game, name, people){
  this.people = people;
	this.game = game;
	Phaser.Sprite.apply(this, [this.game, this.game.world.randomX, this.game.world.randomY,'dude']);
	this.name = name;
	this.game.physics.arcade.enable(this);
	this.body.collideWorldBounds = true;
	this.body.bounce.x = 0.01;
	this.body.bounce.y = 0.01;
	this.addLabel(this.name);
};

Person.prototype = Phaser.Sprite.prototype; 
Person.prototype.constructor = Phaser;

Person.prototype.addAnimations = function(){
	this.animations.add('left', [0, 1, 2, 3], 10, true);
	this.animations.add('right', [5, 6, 7, 8], 10, true);
	this.animations.add('up', [4], 10, true);
	this.animations.add('down', [4], 10, true);
}

Person.prototype.addLabel = function(name){
	var label = this.game.add.text(0,0, name, { font: '10px Helvetica Neue', fill: '#000' });
	label.x = Math.floor((this.width - this.width)*0.5);
	label.y = Math.floor(this.height);
	label.align = 'center';
	this.addChild(label);
};

Person.prototype.within = function(c1,c2,t){
		return Math.abs(c1.x - c2.x) <= t && Math.abs(c1.y - c2.y) <= t;
};

Person.prototype.go_to_loc = function(coord){
		var npc = this;
		var close_enough = 30;
		var that = this;
		return function(){
			if(that.within(npc, coord, close_enough) === true){
				return true;
			}
			else{
				that.update_npc(npc,coord,70);
				return false;
			}
		};
	};
	
Person.prototype.go_to_person = function(name2){
		var npc = this;
		var npc2 = this.people.getnpc(name2);
		var close_enough = 70;
		var that = this;
		return function(){
			if(that.within(npc, npc2, close_enough) === true){
				return true;
			}
			else{
				that.update_npc(npc2,70);
				return false;
			}
		};
	};
	
Person.prototype.wait_for = function(name,name2){
		var npc = this;
		var coord = this.getnpc(name2);
		var close_enough = 30;
		var that = this;
		return function(){
			if(that.within(npc, coord, close_enough) === true){
				return true;
			}
		};
	};

Person.prototype.wait_for_action = function(name, act){
		var npc = this.people.getnpc(name);
		return function(){
			return npc.action === act;
		};
	};

Person.prototype.pause_animation = function(npc){
		npc.animations.play("down");
		npc.animations.stop();
		npc.body.velocity.x = 0;
		npc.body.velocity.y = 0;
	};
	
Person.prototype.npc_state = function(states){
		var npc = this;//.getnpc(name);
		npc.state_m = {
			state:0,
			paused:false,
			states:states,
			next:function(){
				npc.state_m.state = npc.state_m.state + 1;
				if(npc.state_m.state == npc.state_m.states.length){
					npc.state_m.state = 0;
				}
			},
			run:function(){
				if(npc.state_m.paused === false){
					var func = npc.state_m.states[npc.state_m.state];
					if(func.async === true){
						func.init();
						window.setTimeout(function(){
							func.cleanup();
						},func.time);
						npc.state_m.next();
					}
					else{
						if(func() == true){
							npc.state_m.next();
						}
					}
				}
			}
		};
		return npc.state_m;
	}
	Person.prototype.say = function(text,time){
		var that = this;
		var npc = this;
		return {
			async:true,
			init:function(){
				npc.state_m.paused = true;
				that.pause_animation(npc);
				if(npc.dialog !== undefined){
					npc.dialog.destroy();
				}
				npc.sbub = that.game.world.add(new SpeechBubble(game, 110, 190, 100, text));
				npc.addChild(npc.sbub);
        		npc.sbub.x = Math.floor(npc.width/2);
				npc.sbub.y = Math.floor(0);
				//npc.dialog = that.game.add.text(npc.x, npc.y-20, text, { font: '12px monaco', fill: '#000000' });
				npc.action = text;
			},
			cleanup:function(){
				npc.sbub.kill();
				
				//npc.dialog.destroy();
				npc.action = null;
				npc.state_m.paused = false;
			},
			time:time
		};
	};
	Person.prototype.pause = function(time){
		var npc = this;
		var that = this;
		return {
			async:true,
			init:function(){
				npc.state_m.paused = true;
				that.pause_animation(npc);
			},
			cleanup:function(){
				npc.state_m.paused = false;
			},
			time:time
		};
	};
	Person.prototype.update_npc = function(goal, speed){
		this.game.physics.arcade.moveToObject(this, goal, speed);
	};