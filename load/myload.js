var dom = window.dom = {

	createScriptNode:function(){
		var script  = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		return script;
	},
	head:function(){
		return document.getElementsByTagName("head")[0];
	},
	env:{
		loaded:{},
		queue:[],
		define:[]
	},
    module:[],
    isArray:Array.isArray ||function(obj){
        return Object.prototype.toString.call(obj) == '[object Array]';
    },
    //利用agruments 传递参数后面再调
    fireMethod:function(fn){
        fn();//.call();
    },
    checkDeps:function(){
        for(var i = 0 ; i < dom.module.length-1 ; i++){
          var obj = dom.module[i];
          if(obj.state === 1){
              return false;
          }
        }
        return true;
    },
	require:function(list,factory){
		//数组
        var models = list,
            queue = dom.env.queue,
            //用来标识facory是否加载
            fn = "callback";
        //首次进入
        var module = dom.module;
        if(!module.length){
            for(var i = 0 ; i < list.length; i ++){
                module.push({
                   id:list[i],
                   state:1
                });
                queue.push(list[i]);
            }
            module.push({
                id:fn,
                fn:factory,
                state:1
            });
            dom._loadJs();
        }else{
            //module[list].fn = factory;
            dom.fireMethod(factory);
            //module[list].state = 2;
            for(var i = 0 ; i < module.length;i++){
                if(module[i].id == list)
                    module[i].state = 2;
            }
        }
        //define 进入
        if(dom.checkDeps()){
            dom.fireMethod(module[module.length -1].fn);
        }

	},
	_loadJs:function(){
		var queue = dom.env.queue,loaded = dom.env.queue;

		if(queue.length){
			var cur = queue.shift();
			if(typeof cur === "string"){
				if(!loaded[cur]){
					var url = dom.loadBasePath() + cur + ".js";
					var script = dom.createScriptNode();
					script.src = url;
					dom.head().appendChild(script);
				}
				dom._loadJs();
			}else if(typeof cur === "function"){
				dom._loadJs();
			}
		}
	},
	loadBasePath:function(){
		var result = "",src;
		var script = document.getElementsByTagName("script");
		//正则匹配
		var reg = /(\w+)\.js/;

		for(var i = 0 ,el; el =script[i ++];){
			src = !! document.querySelcetor ? el.src :el.getAttribute("src",4);
			result = src;
			break;
		}
		return result.substr(0,result.lastIndexOf('/'));
	},
	define:function(id,factory){
        dom.require(id,factory);
	}
};
