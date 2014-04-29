;(function(WIN,DOM,undefined){
    var
    reg_module_name = /(?:^|\/)([^(\/]+)(?=\(|$)/,
    reg_module_url = /\(([^)]+)\)/,
    reg_multi_module = /\s*,\s*/g,
    _dom = WIN.dom,
    dom = {
        mix : function(target, source ,override) {
            var i, ride = (override === void 0) || override;
            for (i in source) {
                if (ride || !(i in target)) {
                    target[i] = source[i];
                }
            }
            return target;
        },
 
        noConflict: function(  ) {//防止命名冲突，请先行引用其他库再引用本框架
            WIN.dom = _dom;//这是别人的
            return dom;//请赋以其一个命名空间
        },
        //请求模块
        require:function(dependList,callback){
            var self = arguments.callee
            var moduleNames = [], i =0, hash = self.loadedModules,
               re = reg_multi_module, reg = reg_module_name ,moduleName, str;
            if(typeof dependList === "string"){
                dependList  = dependList.split(re)
            }
            while(str = dependList[i++]){
                moduleName = str.match(reg)[1];
                if(!hash[moduleName]){
                    moduleNames.push(moduleName);
                    self.appendScript(str);
                }
            }
            this.provide(moduleNames,hash,callback)
        },
        //声明模块
        declare:function(moduleName,dependList,callback){
            var hash = this.require.loadedModules;
            this.require(dependList,function(){
                callback();
                hash[moduleName] = 1
            })
        },
        //提供模块
        provide:function(array,hash,callback){
            var flag = true, i = 0, args = arguments, fn = args.callee, el;
            while(el = array[i++]){
                if(!hash[el]){
                    flag = false;
                    break;
                }
            }
            if(flag){
                callback();
            }else{
                //javascrpt最短时钟间隔为16ms，这里取其倍数
                //http://blog.csdn.net/aimingoo/archive/2006/12/21/1451556.aspx
                setTimeout(function(){
                    fn.apply(null,args)
                },5000);
            }
        }
    };
    dom.mix(dom.require, {
        loadedModules:{},
        requestedUrl: {},
        //http://www.cnblogs.com/rubylouvre/archive/2011/02/10/1950940.html
        getBasePath:function(){
            var url;
            try{
                a.b.c()
            }catch(e){
                url = e.fileName || e.sourceURL;//针对firefox与safari
            }
            if(!url){
                var script = (function (e) {
                    if(!e) return null;
                    if(e.nodeName.toLowerCase() == 'script') return e;
                    return arguments.callee(e.lastChild)
                })(DOM);//取得核心模块所在的script标签
                url = script.hasAttribute ?  script.src : script.getAttribute('src', 4);
            }
            url = url.substr( 0, url.lastIndexOf('/'));
            dom.require.getBasePath = function(){
                return url;//缓存结果，第一次之后直接返回，再不用计算
            }
            return url;
        },
        appendScript:function(str){
            var module = str, reg = reg_module_url, url;
            //处理dom.node(http://www.cnblogs.com/rubylouvre/dom/node.js)的情形
            var _u = module.match(reg);
            url = _u && _u[1] ? _u[1] : this.getBasePath()+"/"+ str + ".js";
            if(!this.requestedUrl[url]){
                 this.requestedUrl[url] = 1;
                 var script = DOM.createElement("script");
                 script.charset = "utf-8";
                 script.defer = true;
             //  script.async = true;//不能保证多个script标签的执行顺序
                script.src = url;
            //避开IE6的base标签bug
            //http://www.cnblogs.com/rubylouvre/archive/2010/05/18/1738034.html
                DOM.documentElement.firstChild.insertBefore(script,null);//
                this.removeScript(script);  
            }
            
        },
        removeScript:function(script){//移除临时生成的节点
            var parent = script.parentNode;
            if(parent&&parent.nodeType === 1){
                script.onload = script.onreadystatechange = function(){
                    if (-[1,] || this.readyState === "loaded" || this.readyState === "complete" ){
                        if (this.clearAttributes) {
                            this.clearAttributes();
                        } else {
                            this.onload = this.onreadystatechange = null;
                        }
                        parent.removeChild(this)
                    }
                }
            }
        }
    });
    //先行取得核心模块的URL
    dom.require.getBasePath();
    window.dom = dom;
})(this,this.document);