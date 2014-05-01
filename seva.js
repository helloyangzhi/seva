/*
 *  @title          seva.js 
 *  @description    seva javscript framework
 *  @author `       yangzhi<helloyangzhi@foxmail.com>
 *  @vesion         1.0
 *  @Copyright      2014-2015 
 */
;(function(w,u){

    //判断浏览器是遵循W3C标准,或者为IE9+浏览器
    var W3C = w.document.dispatchEvent ? true: false,
        readyList = [],
        class2type = {
            "[object Boolean]" : 'boolean',
            "[object Number]" : 'number',
            "[object String]" : 'string',
            "[object Function]" : 'function',
            "[object Array]" : 'array',
            "[object Date]" : 'date',
            "[object RegExp]" : 'RegExp',
            "[object Object]" : 'object'
        },
        toString = Object.prototype.toString,
        //节点列表
        nodes = [],
        //加载模块
        modules = [];
        //load节点
    //seva framework core model
    var seva = function(){
        return {
            /**
             * @title       ready 
             * @description domReady方法，类型jquery中的ready方法，提前执行方法，在dom结构生成调用
             * @param       fn      回调事件 
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            ready:function(fn){
                if(readyList){
                    readyList.push(fn);
                }else{
                    fn();
                }
            },

            /*
             * @title       bind 
             * @description 绑定事件方法
             * @param       el      元素
             * @param       type    事件类型
             * @param       fn      回调事件 
             * @param       isup    是否采用冒泡方式绑定事件 
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            bind: W3C ? function(el,type,fn,isup){
                 el.addEventListener(type,fn,!!isup);
                 return fn;
            }:function(el,type,fn){
                el.attachEvent && el.attachEvent("on" + type,fn);
                return fn;
            },

            /**
             * @title       extend
             * @description 扩展方法
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            extend:function(){
            },

            /**
             * @title       isFunction
             * @description 检测对象是否为函数
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            isFunction:function(obj){
               return seva.type(obj) === 'function';
            },
  
            /**
             * @title       isArray
             * @description 检测对象是否为数组
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            isArray: Array.isArray || function(obj){
               return seva.type(obj) === 'array';
            },

            /**
             * @title       isNaN
             * @description 判断是否为NaN类型
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            isNaN:function(obj){
                return obj !== null && obj !== obj;
            },
            
            /**
             * @title       type 
             * @description 验证数据类型
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            type: function(obj) {
                    return obj == null ?
                        String( obj ) :
                        class2type[ toString.call(obj) ] || "object";
            },

            /**
             * @title       noop
             * @description 空方法，来自jquery,防止循环调用
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            noop: function(){},

            /**
             * @title       fireMethod
             * @description 执行method,将modules中的回调方法都执行一遍
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            fireMethod:function(list,factory){
                for(var i = 0 ; i < modules.length ; i ++){
                    if(modules[i].id === list){
                        modules[i].state = 2;
                    }
                }
                factory();
            },
            /**
             * @title       require
             * @description 模块加载
             * @param       list    依赖模块列表
             * @param       factory 回调方法
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            require: function(list,factory){

                //factory 匿名函数本身也是一个模块，这个给一个标识
                var fn = "anonymous";

                if(modules.length && modules[modules.length - 1].id === "anonymous"){
                    seva.fireMethod(list,factory);
                }else{
                    //if list is array
                    if(seva.isArray(list)){
                        for(var i = 0,len = list.length;i<len;i++){
                            //nodes.push(list[i]);
                            nodes.push(list[i]);
                            modules[i] = {
                                "id":list[i],
                                "state" :1
                            };
                        }
                    }
                    modules.push({
                        "id" : "anonymous",
                        "fn" : factory,
                        "state" : 1
                    });
                }

                if(seva.checkSetup()){
                    modules[modules.length-1].fn();
                }else{
                    seva._loadJs();
                }
            },
            /**
             * @title       checkSetup 
             * @description 检查所有模块是否完成正常安装
             * @author      yangzhi<helloyangzhi@foxmail.com>
             * @version     1.0
             */
            checkSetup:function(){
                var isture = true;
                for(var i =0 ; i < modules.length - 1;i++){
                   if(modules[i].state === 1){
                       isture = false;
                       break;
                   }
                }
                return isture;
            },
            /*
             * @title       define
             * @description 定义模块
             * @author      yangzhi<helloyangzhi@foxmail.com> 
             * @version     1.0
             */
            define:function(name,refers,factory){
                seva.require(name,factory);
            },
            /*
             * @title       _loadJs
             * @description 加载js
             * @author      yangzhi<helloyangzhi@foxmail.com> 
             * @version     1.0
             */
            _loadJs:function(){
                if(nodes.length){
                    var cur = nodes.shift();
                    if(cur !== "anonymous"){
                        var script = seva.createScript();
                        script.src= cur + ".js";
                        document.getElementsByTagName("head")[0].appendChild(script);

                        //为模块添加onload或者onreadystatechange事件，成功加载提示安装成功
                        script[ W3C ? "onload" : "onreadystatechange" ] = function(){
                            if(W3C || document.readyState === "complete"){
                                console.log("成功加载模块:" + cur);
                            }
                        }

                        //继续加载
                        seva._loadJs();
                    }
                }
            },
            /*
             * @title       _loadJs
             * @description 动态创建js节点
             * @author      yangzhi<helloyangzhi@foxmail.com> 
             * @version     1.0
             */
            createScript:function(){
                var script = document.createElement("script");
                    script.type="text/javascript";
                    script.charset="utf-8";
                return script;
            },
            getBasePath:function(){
                var result = "",src;
                var script = document.getElementsByTagName("script");
                for(var i = 0 ,el; el =script[i ++];){
                    src = !! document.querySelcetor ? el.src :el.getAttribute("src",4);
                    result = src;
                    break;
                }
                return result.substr(0,result.lastIndexOf('/'));
            }
        };
    }(); 

    var readyFn,ready = W3C ? "DOMContentLoaded" : "readystatechange";

    //firefox低版本不支持readyState,所以自定义一个readyState变量
    if(!document.readyState){
        var readyState = DOC.readyState = "loading";
    }

    /*
     * @title       doScrollCallback
     * @description 利用ie下doscroll方法的hack，
                    该方法会在浏览器documentready之后立刻调用。仅仅使用在ie下。
                    http://javascript.nwbox.com/IEContentLoaded/
     * @author      yangzhi<helloyangzhi@foxmail.com> 
     * @version     1.0
     */
    function doScrollCallback(){
        try{
            document.documentElement.doScroll('left');
        }catch(e){
            setTimeout(arguments.callee,1);
            return;
        }
        fireReady();
    };

    /*
     * @title       fireReady 
     * @description 执行ready绑定胡回调方法
     * @author      yangzhi<helloyangzhi@foxmail.com> 
     * @version     1.0
     */

    function fireReady (){
        for (var i = 0 , fn; fn = readyList[i++];){
            fn();
        }

        readyList = null;
        fireReady = seva.noop; //隋性函数，防止IE9二次调用_checkDeps
    }

    //如果是在domReady之后再加载的方法,那么立刻执行.
    if(document.readyState === "complete"){
        fireReady();
    }else{
        seva.bind(document,ready,readyFn = function(){
            if(W3C || document.readyState == "complete"){
                fireReady();
                if(readyState){
                    document.readyState = "complete";
                }
            }
        });
        // If IE and not a frame
        // continually check to see if the document is ready,some thing from jquery source code
        var toplevel = false;

        try {
            toplevel = window.frameElement == null;
        } catch(e) {}

        if (document.documentElement.doScroll && toplevel ) {
            doScrollCheck();
        }
    }

    //挂载到window下
    window.sv = window.seva =  seva;
})(window,undefined);

