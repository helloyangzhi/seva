    var readyList = [];
    atom.ready = function(fn){
        if(readyList){
            fn.push(fn);
        }else{
            fn();
        }
    };
//============================domReady机制===========================
    var readyFn, ready = W3C ? "DOMContentLoaded" : "readystatechange";
  
    function fireReady() {
        for (var i = 0 , fn; fn = readyList[i++];){
            fn();
        }
        readyList = null;
        fireReady = $.noop; //隋性函数，防止IE9二次调用_checkDeps
    }

    function doScrollCheck() {
        try { //IE下通过doScrollCheck检测DOM树是否建完
            html.doScroll("left");
            fireReady();
        } catch (e) {
            setTimeout(doScrollCheck);
        }
    }
    ;
    //在firefox3.6之前，不存在readyState属性
    //http://www.cnblogs.com/rubylouvre/archive/2012/12/18/2822912.html
    if (!DOC.readyState) {
        var readyState = DOC.readyState = "loading";
    }
    if (DOC.readyState === "complete") {
        fireReady(); //如果在domReady之外加载
    } else {
        $.bind(DOC, ready, readyFn = function() {
            if (W3C || DOC.readyState === "complete") {
                fireReady();
                if (readyState) { //IE下不能改写DOC.readyState
                    DOC.readyState = "complete";
                }
            }
        });
        if (html.doScroll) {
            try { //如果跨域会报错，那时肯定证明是存在两个窗口
                if (self.eval === parent.eval) {
                    doScrollCheck();
                }
            } catch (e) {
                doScrollCheck();
            }
        }
    }
    
    //============================bind机制===========================
    
    bind: W3C ? function(el, type, fn, phase) {
            el.addEventListener(type, fn, !!phase);
            return fn;
    } : function(el, type, fn) {
            el.attachEvent && el.attachEvent("on" + type, fn);
            return fn;
    }
