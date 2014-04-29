var dom = window.dom = {
    genScriptNode : function() {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.charset = "utf-8";
        return script;
    },
    head:function(){
        return document.getElementsByTagName("head")[0]
    },
    env:{     
        loaded:{}, //已经加载的文件hash
        queue:[] //待处理列队
    },
    //使用模块
    use: function(name, callback, config) {
        config = config || {};
        var depends = config.use || [],queue = dom.env.queue,i,item;
        //去掉“dom.”前缀，防止混乱
        name = name.indexOf("dom.") === 0 ? name.slice(4):name
        if(!name)//必须指定模块名
            return this;
        if(queue.length){//配置列队
            //如果是加载一个模块过程中需要加载其他模块，我们需要首先执行那些依赖模块，
            //因此顺序都是倒着加入队列
            queue.unshift(callback);
            queue.unshift(name);
            i = depends.length;
            while (i--) {
                //添加所有依赖
                queue.unshift(depends[i]);
            }
        }else{//配置列队
            for(i=0;item = depends[i++];){
                //添加所有依赖
                queue.push(item);
            }
            //添加模块名，用于可能的文件加载
            queue.push(name);
            //添加回调函数（也有可能是模块本身）
            queue.push(callback);
        }
        dom._loadNext();//开始执行列队
        return this;
    },
    //用于标识此模块所在的JS文件已经被加载，并清除timeoutID
    loaded:function(name){
        dom.env.loaded[name] = true;
        var timeoutID = dom.namespace("dom."+name,true).timeoutID;
        timeoutID && clearTimeout(timeoutID)
    },
    //name为模块名，create不存在此属性是否创建一个空对象
    namespace:function(name,create,context){
        var parts=name.split("."),obj = context || window;
        for(var i=0, p; obj && (p=parts[i]); i++){
            if(i == 0 && this[p]){
                p = this[p];
            }
            obj = (p in obj ? obj[p] : (create ? obj[p]={} : undefined));
        }
        return obj; 
    },
    //加载文件，装配新模块或执行回调
    _loadNext:function(){
        var env = dom.env, queue = env.queue,loaded = env.loaded;
        if(queue.length){
            var item = queue.shift();
            if(typeof item === "string" ){
                if(!loaded[item]){//如果此模块所在的JS文件还没有加载，则加载它 
                    var module = "dom."+item,url;
                    //处理dom.node(http://www.cnblogs.com/rubylouvre/dom/node.js)的情形
                    var _u = module.match(/\(([^)]+)\)/);
                    url = _u && _u[1] ? _u[1] : dom.getBasePath()+"/"+ module.replace(/\./g, "/") + ".js";
                    var script = dom.genScriptNode();
                    script.src = url
                    dom.head().appendChild(script);
                    var scope = dom.namespace(module,true)
                    scope.timeoutID = setTimeout(function(){
                        alert("Fail to load module '"+module+"'!")
                    },1000)
                //让将要加载JS文件中的函数调用 
                    dom._loadNext();
                }else{
                    //否则跳过，继续处理下一个
                    dom._loadNext();
                }
            //如果是函数，可能是普通的回调函数，也可能是模块本身
            }else if(typeof item === "function"){
                if(!item._attached){//如果是模块则只会执行一次
                    item();
                }
                dom._loadNext();
            }
        }
    },
    //获取核心模块所在的JS文件所在的文件夹路径
    getBasePath : function(){  
        var result = "",m;
        try{
            a.b.c();
        }catch(e){
            if(e.fileName){//firefox
                result = e.fileName;
            }else if(e.sourceURL){//safari
                result = e.sourceURL;
            }else if(e.stacktrace){//opera9
                m = e.stacktrace.match(/\(\) in\s+(.*?\:\/\/\S+)/m);
                if (m && m[1])
                    result =  m[1]
            }else if(e.stack){//chrome 4+
                m= e.stack.match(/\(([^)]+)\)/)
                if (m && m[1])
                    result = m[1]
            }
        }
        if(!result){//IE与chrome4- opera10+
            var scripts = document.getElementsByTagName("script");
            var reg = /dom([.-]\d)*\.js(\W|$)/i,src
            for(var i=0, el; el = scripts[i++];){
                src = !!document.querySelector ? el.src:
                el.getAttribute("src",4); 
                result = src;
                break;
            }
        }
            return result.substr( 0, result.lastIndexOf('/'));
        }
    };
